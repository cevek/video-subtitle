export interface Sub {
    start: number;
    dur: number;
    text: string;
}

function fetchWithCache(url: string) {
    var data = localStorage.getItem(url);
    if (data) {
        return Promise.resolve(data);
    }
    return fetch(url).then(response => response.text()).then((data) => {
        localStorage.setItem(url, data);
        return data;
    });
}

export function fetchYTSubs(videoId: string) {
    return fetchWithCache('/api/subtitles?yturl=' + encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)).then(data => JSON.parse(data)).then((data: { urls: string[] }) => {
        console.log(data);
        var url = data.urls.find(url => !/kind=asr/.test(url) && !!url.match(/lang=en/));
        if (url) {
            return fetchTrascript(url);
        }
        return null;
    });
}

function fetchTrascript(url: string) {
    return fetchWithCache(url).then<Sub[] | null>((data) => {
        // console.log(data);
        var div = document.createElement('div');
        div.innerHTML = data;
        var trascript = [...div.childNodes[1].childNodes].map((n: HTMLElement) => ({
            start: +n.getAttribute('start')!,
            dur: +n.getAttribute('dur')!,
            text: n.textContent!.replace(/&#39;/g, "'"),
        }));
        return trascript;
    });
}