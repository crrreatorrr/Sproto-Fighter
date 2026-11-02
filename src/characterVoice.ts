/** A short local callout triggered once when the move starts, never by rendering. */
let retainVoice: HTMLAudioElement | undefined;
export function playRetainCallout() {
 retainVoice ??= new Audio('/fighters/voices/retain.wav');
 retainVoice.volume=.9;retainVoice.currentTime=0;
 void retainVoice.play().catch(()=>{ /* Audio may be disabled by browser preferences. */ });
}
