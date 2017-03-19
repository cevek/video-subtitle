import * as React from 'react';
import { Player } from "./Player";
import { Sub, fetchYTSubs } from "./Sub";
export class App extends React.Component<{}, {}>{
    subs: Sub[] | null;
    videoId: string | null;
    onSubmit = (e: React.FormEvent<{}>) => {
        e.preventDefault();
        var urlEl = this.refs.url as HTMLInputElement;
        var url = urlEl.value;
        localStorage.setItem('yt_url', url);
        var m = url.match(/v=(.*?)(&|$)/);
        if (m) {
            var videoId = m[1];
            this.videoId = videoId;
            console.log(url, videoId);
            fetchYTSubs(videoId).then((subs) => {
                this.subs = subs;
                console.log(subs);
                this.forceUpdate();
            }, err => console.error(err));
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <input ref="url" type="text" defaultValue={localStorage.getItem('yt_url') || ''} placeholder="Youtube Video URL..." />
                    <button>Submit</button>
                </form>
                <div ref="video"></div>
                {this.subs && this.videoId && <Player videoId={this.videoId} subtitles={this.subs} />}
            </div>
        );
    }
}
