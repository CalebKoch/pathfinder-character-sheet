
var rules={utils:{toModifierString:function(modifier){return(modifier>0?'+':'')+modifier;}},abilities:{getModifier:function(score){return Math.floor(score/2)-5;},getBonusSpell:function(score,level){var temp=Math.ceil((rules.abilities.getModifier(score)-level+1)/4);return(temp>0&&level>0)?temp:0;}},sizes:['Colossal','Gargantuan','Huge','Large','Medium','Small','Tiny','Diminutive','Fine'],saves:{getSaves:function(character){var computed,classIterator,bonus,save,iterator,value;computed={fortitude:{reason:['constitution '+rules.utils.toModifierString(character.computed.abilities.constitution.modifier)],bonuses:{constitution:character.computed.abilities.constitution.modifier},score:0},reflex:{reason:['dexterity '+rules.utils.toModifierString(character.computed.abilities.dexterity.modifier)],bonuses:{dexterity:character.computed.abilities.dexterity.modifier},score:0},will:{reason:['wisdom '+rules.utils.toModifierString(character.computed.abilities.wisdom.modifier)],bonuses:{wisdom:character.computed.abilities.wisdom.modifier},score:0}};for(classIterator in character.computed.levels){if(character.computed.levels.hasOwnProperty(classIterator)){for(save in computed){if(computed.hasOwnProperty(save)){bonus=rules.classes[classIterator].saves[save](character.computed.levels[classIterator]);computed[save].bonuses.level=(computed[save].bonuses.level||0)+bonus;computed[save].reason.push(classIterator+' '+character.computed.levels[classIterator]+': '+rules.utils.toModifierString(bonus));}}}}
for(iterator in character.equip.slots){if(character.equip.slots.hasOwnProperty(iterator)){if(character.equip.slots[iterator]&&character.equip.slots[iterator].saves){for(save in character.equip.slots[iterator].saves){if(character.equip.slots[iterator].saves.hasOwnProperty(save)){for(bonus in character.equip.slots[iterator].saves[save]){if(character.equip.slots[iterator].saves[save].hasOwnProperty(bonus)){value=character.equip.slots[iterator].saves[save][bonus];computed[save].bonuses[bonus]=Math.max((computed[save].bonuses[bonus]||0),value);computed[save].reason.push(bonus+rules.utils.toModifierString(value)+" ("+character.equip.slots[iterator].name+" ["+iterator+"])");computed[save].hasBonus=true;}}}}}}}
for(iterator in character.buffs){if(character.buffs.hasOwnProperty(iterator)){if(character.buffs[iterator].saves){for(save in character.buffs[iterator].saves){if(character.buffs[iterator].saves.hasOwnProperty(save)){for(bonus in character.buffs[iterator].saves[save]){if(character.buffs[iterator].saves[save].hasOwnProperty(bonus)){value=character.buffs[iterator].saves[save][bonus];computed[save].bonuses[bonus]=Math.max((computed[save].bonuses[bonus]||0),value);computed[save].reason.push(bonus+rules.utils.toModifierString(value)+" ("+iterator+")");computed[save].hasBonus=true;}}}}}}}
for(save in computed){if(computed.hasOwnProperty(save)){for(bonus in computed[save].bonuses){if(computed[save].bonuses.hasOwnProperty(bonus)){computed[save].score+=computed[save].bonuses[bonus];}}}}
return computed;},strong:function(level){return Math.floor(level/2)+2;},normal:function(level){return Math.floor(level/3);}},combat:{getSizeBonus:function(character){var size=character.size-4;if(size==0){return 0;}
return(size<0?-1:1)*Math.pow(2,Math.abs(size)-1);},getBaseAttackBonus:function(levels){var babTotal=0,cl;for(cl in levels){if(levels.hasOwnProperty(cl)){babTotal+=rules.classes[cl].combat.bab(levels[cl]);}}
return babTotal;},armor:function(character){return 10+'armor bonus'+'shield bonus'+'dex modifier'+'enhancement bonuses'+'deflection bonus'+'natural armor'+'dodge bonus'+this.combat.getSizeBonus(character);},bab:{melee:function(level){return level;},hybrid:function(level){return Math.floor(level*3/4);},caster:function(level){return Math.floor(level/2);}}},getTotalLevel:function(levels){return levels.length;},getAggregateLevels:function(levels){var i,aggregate={};for(i=0;i<levels.length;i++){aggregate[levels[i]['class']]=(aggregate[levels[i]['class']]||0)+1;}
return aggregate;},getAbilities:function(character){var ability,computed,iterator,bonus,value;computed={};for(ability in character.abilities){if(character.abilities.hasOwnProperty(ability)){computed[ability]={};computed[ability].reason=['Base '+character.abilities[ability].base];computed[ability].hasBonus=false;computed[ability].base=character.abilities[ability].base;computed[ability].bonuses={};if(character.abilities[ability].hasOwnProperty('racial')){computed[ability].bonuses.racial=character.abilities[ability].racial;computed[ability].reason.push('Racial '+rules.utils.toModifierString(computed[ability].bonuses.racial));}}}
for(iterator in character.levels){if(character.levels.hasOwnProperty(iterator)){if(character.levels[iterator].bonus.abilities){for(ability in character.levels[iterator].bonus.abilities){if(character.levels[iterator].bonus.abilities.hasOwnProperty(ability)){computed[ability].bonuses.level=(computed[ability].bonuses.level||0)+character.levels[iterator].bonus.abilities[ability].level;computed[ability].reason.push('Level '+(iterator+1)+' +1');}}}}}
for(iterator in character.equip.slots){if(character.equip.slots.hasOwnProperty(iterator)){if(character.equip.slots[iterator]&&character.equip.slots[iterator].abilities){for(ability in character.equip.slots[iterator].abilities){if(character.equip.slots[iterator].abilities.hasOwnProperty(ability)){for(bonus in character.equip.slots[iterator].abilities[ability]){if(character.equip.slots[iterator].abilities[ability].hasOwnProperty(bonus)){value=character.equip.slots[iterator].abilities[ability][bonus];computed[ability].bonuses[bonus]=Math.max((computed[ability].bonuses[bonus]||0),value);computed[ability].reason.push(bonus+rules.utils.toModifierString(value)+" ("+character.equip.slots[iterator].name+" ["+iterator+"])");computed[ability].hasBonus=true;}}}}}}}
for(iterator in character.buffs){if(character.buffs.hasOwnProperty(iterator)){if(character.buffs[iterator].abilities){for(ability in character.buffs[iterator].abilities){if(character.buffs[iterator].abilities.hasOwnProperty(ability)){for(bonus in character.buffs[iterator].abilities[ability]){if(character.buffs[iterator].abilities[ability].hasOwnProperty(bonus)){value=character.buffs[iterator].abilities[ability][bonus];computed[ability].bonuses[bonus]=Math.max((computed[ability].bonuses[bonus]||0),value);computed[ability].reason.push(bonus+rules.utils.toModifierString(value)+" ("+iterator+")");computed[ability].hasBonus=true;}}}}}}}
for(ability in computed){if(computed.hasOwnProperty(ability)){computed[ability].score=computed[ability].base;for(bonus in computed[ability].bonuses){if(computed[ability].bonuses.hasOwnProperty(bonus)){computed[ability].score+=computed[ability].bonuses[bonus];}}
computed[ability].modifier=rules.abilities.getModifier(computed[ability].score);}}
return computed;}};(function(rules){rules.classes={barbarian:{combat:{bab:function(level){return rules.combat.bab.melee(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.normal(level);},will:function(level){return rules.saves.normal(level);}}},bard:{combat:{bab:function(level){return rules.combat.bab.hybrid(level);}},saves:{fortitude:function(level){return rules.saves.normal(level);},reflex:function(level){return rules.saves.strong(level);},will:function(level){return rules.saves.strong(level);}}},cleric:{combat:{bab:function(level){return rules.combat.bab.hybrid(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.normal(level);},will:function(level){return rules.saves.strong(level);}}},druid:{combat:{bab:function(level){return rules.combat.bab.hybrid(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.normal(level);},will:function(level){return rules.saves.strong(level);}}},fighter:{combat:{bab:function(level){return rules.combat.bab.melee(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.normal(level);},will:function(level){return rules.saves.normal(level);}}},monk:{combat:{bab:function(level){return rules.combat.bab.hybrid(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.strong(level);},will:function(level){return rules.saves.strong(level);}}},paladin:{combat:{bab:function(level){return rules.combat.bab.melee(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.normal(level);},will:function(level){return rules.saves.strong(level);}}},ranger:{combat:{bab:function(level){return rules.combat.bab.melee(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.strong(level);},will:function(level){return rules.saves.normal(level);}}},rogue:{combat:{bab:function(level){return rules.combat.bab.hybrid(level);}},saves:{fortitude:function(level){return rules.saves.normal(level);},reflex:function(level){return rules.saves.strong(level);},will:function(level){return rules.saves.normal(level);}}},sorcerer:{combat:{bab:function(level){return rules.combat.bab.caster(level);}},saves:{fortitude:function(level){return rules.saves.normal(level);},reflex:function(level){return rules.saves.normal(level);},will:function(level){return rules.saves.strong(level);}}}};}(window.rules));(function(rules){rules.buffs={"Bear's Endurance":{"abilities":{"constitution":{"enhancement":4}}},"Bull's Strength":{"abilities":{"strength":{"enhancement":4}}},"Cat's grace":{"abilities":{"dexterity":{"enhancement":4}}},"Eagle's Splendor":{"abilities":{"charisma":{"enhancement":4}}},"Fox's Cunning":{"abilities":{"intelligence":{"enhancement":4}}},"Owl's Wisdom":{"abilities":{"wisdom":{"enhancement":4}}},"Mage Armor":{"armor":{"bonus":4}},"Divine Favor":{"combat":{"attack":{"luck":1},"damage":{"luck":1}},"adjustment":{"parameter":"caster level","parameter type":"number","multiplier":function(param){return Math.max((param-param%3)/3+1,3);}}},"Fly":{"general":{"speed":60}}};}(window.rules));(function(rules){"use strict";rules.classes.alchemist={combat:{bab:function(level){return rules.combat.bab.hybrid(level);}},saves:{fortitude:function(level){return rules.saves.strong(level);},reflex:function(level){return rules.saves.strong(level);},will:function(level){return rules.saves.normal(level);}},spells:{_daily:[[0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0],[0,2,0,0,0,0,0,0,0,0],[0,3,0,0,0,0,0,0,0,0],[0,3,1,0,0,0,0,0,0,0],[0,4,2,0,0,0,0,0,0,0],[0,4,3,0,0,0,0,0,0,0],[0,4,3,1,0,0,0,0,0,0],[0,4,4,2,0,0,0,0,0,0],[0,5,4,3,0,0,0,0,0,0],[0,5,4,3,1,0,0,0,0,0],[0,5,4,4,2,0,0,0,0,0],[0,5,5,4,3,0,0,0,0,0],[0,5,5,4,3,1,0,0,0,0],[0,5,5,4,4,2,0,0,0,0],[0,5,5,5,4,3,0,0,0,0],[0,5,5,5,4,3,1,0,0,0],[0,5,5,5,4,4,2,0,0,0],[0,5,5,5,5,4,3,0,0,0],[0,5,5,5,5,5,4,0,0,0],[0,5,5,5,5,5,5,0,0,0]],daily:function(casterLevel,level){return rules.classes.alchemist.spells._daily[casterLevel][level];}}};}(window.rules));(function(rules){rules.classes.wizard={combat:{bab:function(level){return rules.combat.bab.caster(level);}},saves:{fortitude:function(level){return rules.saves.normal(level);},reflex:function(level){return rules.saves.normal(level);},will:function(level){return rules.saves.strong(level);}},spells:{daily:function(casterLevel,level){if(level==0){return casterLevel==1?3:4;}else if(level==9){return Math.max(0,casterLevel-16)||'-';}else if((casterLevel+1)/2<level){return'-';}else if((casterLevel+1)/2==level){return 1;}else if(Math.floor((casterLevel)/2)==level){return 2;}else if((casterLevel-5)/2<level&&(casterLevel!=20)){return 3;}else{return 4;}}}};}(window.rules));