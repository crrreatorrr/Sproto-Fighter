/** Resolve public art under the build's HTML base; Node/diagnostic fixtures use root paths. */
const asset=(path:string)=>{
 const base=typeof document==='undefined'?'/':(document.querySelector?.('meta[name="sproto-asset-base"]') as HTMLMetaElement|null)?.content||'/';
 return base+path.replace(/^\/+/, '');
};
/** A short local callout triggered once when the move starts, never by rendering. */
let retainVoice: HTMLAudioElement | undefined;
export function playRetainCallout() {
 retainVoice ??= new Audio(asset('/fighters/voices/retain.wav'));
 retainVoice.volume=.9;retainVoice.currentTime=0;
 void retainVoice.play().catch(()=>{ /* Audio may be disabled by browser preferences. */ });
}
