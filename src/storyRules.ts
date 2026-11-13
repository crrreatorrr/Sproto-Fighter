import {chapterBossModifier,type MatchModifier,type PlayableFighterId} from './core';
import {STORY_ENCOUNTERS} from './storyProgress';

/**
 * The rule a story fight runs under, or null for standard rules. The last standard rival of
 * each chapter fights under that chapter's rule with a 60-second clock. Transformed boss forms
 * (`transformed`, from the story animation plan) use their own controller and keep their own rules.
 */
export function storyChapterRule(opponent:PlayableFighterId,transformed:(id:PlayableFighterId)=>boolean):MatchModifier|null{
    const encounter=STORY_ENCOUNTERS.find(e=>e.opponents.includes(opponent));
    if(!encounter||opponent!==encounter.opponents.at(-1))return null;
    const finale=STORY_ENCOUNTERS.filter(e=>e.chapter===encounter.chapter&&!transformed(e.opponents.at(-1)!)).at(-1);
    return finale?.index===encounter.index?chapterBossModifier(encounter.chapter-1):null;
}
