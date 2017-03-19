declare var YT: any;
var resolve: () => void;
var reject;
export var YTReady = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
});
(window as any).onYouTubeIframeAPIReady = () => { console.log('yeah'); resolve() }

export function createPlayer(dom: string | HTMLElement, options: any) {
    return YTReady.then(() => {
        console.log('YT created');
        options.events = options.events || {};
        return new Promise((res, rej) => {
            options.events.onReady = () => res(player);
            var player = new YT.Player(dom, options);
        });
    });
}


import * as React from 'react';
import { Sub } from "./Sub";

interface PlayerProps {
    subtitles: Sub[];
    videoId: string;
}

export class Player extends React.Component<PlayerProps, {}>{
    player: any;
    playerState = false;
    timeout: number;
    currentTime: number = 0;
    getCurrentState = () => {
        this.playerState = this.player.getPlayerState();
        this.currentTime = this.player.getCurrentTime();
        if (this.playerState === YT.PlayerState.PLAYING) {
            this.timeout = setTimeout(this.getCurrentState);
        }
        this.forceUpdate();
    }

    componentDidMount() {
        createPlayer(this.refs.player as HTMLElement, {
            videoId: this.props.videoId,
            playerVars: {
                cc_load_policy: 0,
                enablejsapi: 1,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,
                // hl: 'ru',
                showinfo: 0,
                // controls: 0,
            },
            events: {
                onStateChange: () => {
                    this.getCurrentState();
                }
            }
        }).then(p => this.player = p, err => console.error(err));
    }

    // shouldComponentUpdate() {
    // return false;
    // }

    onSubClick = (sub: Sub) => {
        this.player.seekTo(sub.start, true);
    }

    render() {
        var { subtitles } = this.props;
        return (
            <div>
                {/*<div className="time">{this.currentTime}</div>*/}
                <div className="video" ref="player"></div>
                <Subtitles currentTime={this.currentTime} onSubClick={this.onSubClick} subtitles={subtitles} />
            </div>
        );
    }
}



interface SubtitlesProps {
    subtitles: Sub[];
    currentTime: number;
    onSubClick: (sub: Sub) => void;
}
class Subtitles extends React.Component<SubtitlesProps, {}> {
    render() {
        var { subtitles, currentTime, onSubClick } = this.props;
        return (
            <div className="subtitles">
                {subtitles.map((sub, i) => <Subtitle key={i} currentTime={currentTime} onSubClick={onSubClick} sub={sub} />)}
            </div>
        );
    }
}



function Subtitle({ sub, currentTime, onSubClick }: { sub: Sub, currentTime: number, onSubClick: (sub: Sub) => void; }) {
    return (
        <div onClick={()=>onSubClick(sub)} className={'sub ' + (sub.start <= currentTime && sub.start + sub.dur > currentTime ? 'selected' : '')}>
            {sub.text}
        </div>
    );
}

