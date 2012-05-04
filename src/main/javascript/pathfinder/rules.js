/*global console*/

var rules = {
    utils:{
        toModifierString: function(modifier){
            return (modifier > 0 ? '+' : '') + modifier;
        },
        updateCharacter:function(character){
            var computed, slot, ability, save, bonus, value, toReason,
                extractBonuses, extractInnerBonus, buff, level, caste;
            
            toReason = function(bonus, value, name, slot){
                if(slot && name){
                    return (bonus || '') + rules.utils.toModifierString(value) + " (" + name + " ["+slot+"])";                    
                }else if (name){
                    return (bonus || '') + rules.utils.toModifierString(value) + " (" + name + ")";
                }else{
                    return (bonus || '') + rules.utils.toModifierString(value);
                }
            };
            
            extractBonuses = function(items, name, slot, computed, stackable){
                var item, bonus;
                for(item in items){
                    if(items.hasOwnProperty(item)){
                        extractInnerBonus(items[item],name,slot,computed[item], stackable);
                    }
                }
            };

            extractInnerBonus = function(item, name, slot, computed, stackable){
                var bonus;
                for(bonus in item){
                    if(item.hasOwnProperty(bonus)){
                        //console.log(bonus, item, name, slot, computed);
                        value = item[bonus];
                        if(stackable){
                            computed.bonuses[bonus] = (computed.bonuses[bonus] || 0) + value;
                        }else{
                            computed.bonuses[bonus] = Math.max((computed.bonuses[bonus] || 0), value);                            
                        }
                        computed.reason.push(toReason(bonus, value, name, slot));
                        computed.hasBonus = true;
                    }                                
                }
            };

            computed = {
                abilities:{},
                saves:{
                    fortitude:{reason:[], bonuses:{}, score:0},
                    reflex:{reason:[], bonuses:{}, score:0},
                    will:{reason:[], bonuses:{}, score:0}
                },
                classes: rules.getAggregateLevels(character.levels),
                armor:{reason:[], bonuses:{}}
            };

            for(ability in character.abilities){
                if(character.abilities.hasOwnProperty(ability)){
                    computed.abilities[ability]={};
                    computed.abilities[ability].reason = [toReason(null,character.abilities[ability].base, 'Base')];
                    computed.abilities[ability].hasBonus = false;
                    computed.abilities[ability].base = character.abilities[ability].base;
                    computed.abilities[ability].bonuses = {};
                    if(character.abilities[ability].hasOwnProperty('racial')){
                        computed.abilities[ability].bonuses.racial = character.abilities[ability].racial;
                        computed.abilities[ability].reason.push(toReason('racial',character.abilities[ability].racial));
                    }
                }
            }

            for(caste in computed.classes){
                if(computed.classes.hasOwnProperty(caste)){
                    for(save in computed.saves){
                        if(computed.saves.hasOwnProperty(save)){
                            value = rules.classes[caste].saves[save](computed.classes[caste]);
                            computed.saves[save].bonuses.level = (computed.saves[save].bonuses.level || 0) + value;
                            computed.saves[save].reason.push(toReason(null,value, caste + ' ' + computed.classes[caste]));
                        }
                    }
                }
            }

            for(level in character.levels){
                if(character.levels.hasOwnProperty(level)){
                    if(character.levels[level].bonus.abilities){
                        extractBonuses(character.levels[level].bonus.abilities, 'level', level+1, computed.abilities, true);
                    }
                }
            }

            for(slot in character.equip.slots){
                if(character.equip.slots.hasOwnProperty(slot) && character.equip.slots[slot]){
                    if(character.equip.slots[slot].abilities){
                        extractBonuses(character.equip.slots[slot].abilities, character.equip.slots[slot].name, slot, computed.abilities);
                    }
                    if(character.equip.slots[slot].saves){
                        extractBonuses(character.equip.slots[slot].saves, character.equip.slots[slot].name, slot, computed.saves);
                    }
                    if(character.equip.slots[slot].armor){
                        extractInnerBonus(character.equip.slots[slot].armor, character.equip.slots[slot].name, slot, computed.armor);
                    }
                    if(character.equip.slots[slot].penalties){
                        console.warn("there are unaccounted equip penalties!");
                    }
                }
            }
            
            for(buff in character.buffs){
                if(character.buffs.hasOwnProperty(buff)){
                    if(character.buffs[buff].abilities){
                        extractBonuses(character.buffs[buff].abilities, buff, "", computed.abilities);
                    }
                    if(character.buffs[buff].saves){
                        extractBonuses(character.buffs[buff].saves, buff, "", computed.saves);
                    }
                    if(character.buffs[buff].armor){
                        extractInnerBonus(character.buffs[buff].armor, buff, "", computed.armor);
                    }
                    if(character.buffs[buff].penalties){
                        console.warn("there are unaccounted buff penalties!");
                    }
                }
            }


            for(ability in computed.abilities){
                if(computed.abilities.hasOwnProperty(ability)){
                    computed.abilities[ability].score = computed.abilities[ability].base;
                    for(bonus in computed.abilities[ability].bonuses){
                        if(computed.abilities[ability].bonuses.hasOwnProperty(bonus)){
                            computed.abilities[ability].score += computed.abilities[ability].bonuses[bonus];
                        }
                    }
                    computed.abilities[ability].modifier = rules.abilities.getModifier(computed.abilities[ability].score);
                }
            }
            
            computed.saves.fortitude.bonuses.constitution = computed.abilities.constitution.modifier;
            computed.saves.fortitude.reason.unshift('constitution ' + rules.utils.toModifierString(computed.abilities.constitution.modifier));
            computed.saves.reflex.bonuses.dexterity = computed.abilities.dexterity.modifier;
            computed.saves.reflex.reason.unshift('dexterity ' + rules.utils.toModifierString(computed.abilities.dexterity.modifier));
            computed.saves.will.bonuses.wisdom = computed.abilities.wisdom.modifier;
            computed.saves.will.reason.unshift('wisdom ' + rules.utils.toModifierString(computed.abilities.wisdom.modifier));
            
            for(save in computed.saves){
                if(computed.saves.hasOwnProperty(save) && computed.saves[save].bonuses){
                    for(bonus in computed.saves[save].bonuses){
                        if(computed.saves[save].bonuses.hasOwnProperty(bonus)){
                            computed.saves[save].score += computed.saves[save].bonuses[bonus];
                        }
                    }
                }
            }
            
            return computed;
        }
    },
    abilities:{
        getModifier: function(score){
            return Math.floor(score/ 2)-5;  
        },
        getBonusSpell: function(score, level){
            var temp = Math.ceil((rules.abilities.getModifier(score) - level + 1) / 4);
            return (temp > 0 && level > 0)? temp : 0;
        }
    },
    sizes:['Colossal', 'Gargantuan', 'Huge', 'Large', 'Medium', 'Small', 'Tiny', 'Diminutive', 'Fine'],
    saves:{
        strong: function(level){
            return Math.floor(level/2)+2;
        },
        normal: function(level){
            return Math.floor(level/3);
        }
    },
    combat:{
        getSizeBonus:function(character){
            var size = character.size -4;
            if(size == 0){
                return 0;
            }
            return (size<0?-1:1)*Math.pow(2,Math.abs(size)-1);
        },
        getBaseAttackBonus: function(classes){
            var babTotal=0, caste;
            for(caste in classes){
                if(classes.hasOwnProperty(caste)){
                    babTotal += rules.classes[caste].combat.bab(classes[caste]);
                }
            }
            return babTotal;
        },
        armor:function(character){
            return 10 + 'armor bonus' + 'shield bonus' + character.computed.abilities.dexterity.modifier + 'enhancement bonuses' + 'deflection bonus' + 'natural armor' + 'dodge bonus' + this.combat.getSizeBonus(character);
        },
        bab:{
            melee:function(level){
                return level;
            },
            hybrid:function(level){
                return Math.floor(level*3/4);
            },
            caster:function(level){
                return Math.floor(level/2);
            }
        }
    },
    getTotalLevel: function(levels){
        return levels.length;
    },
    getAggregateLevels: function(levels){
        var i, aggregate = {};
        for(i=0;i<levels.length;i++){
            aggregate[levels[i].caste] = (aggregate[levels[i].caste] || 0) + 1;
        }
        return aggregate;  
    }
};