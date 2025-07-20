import { Skill, SkillFactory } from './Skill.js';
import { skillRegistry } from './SkillRegistry.js';

/**
 * Register all default skills that match the current game mechanics
 */
export function registerDefaultSkills() {
  // Attack - deals 1-49 damage
  const attack = SkillFactory.createAttackSkill('attack', { min: 1, max: 49 }, 0);
  skillRegistry.register(attack);

  // Heal - costs 5 MP, heals 20-40% of max HP
  const heal = new Skill({
    name: 'heal',
    type: 'support',
    mpCost: 5,
    healing: (caster, target) => {
      const healPercent = Math.floor(Math.random() * 21) + 20; // 20-40%
      return Math.floor(caster.maxHp * (healPercent / 100));
    },
    target: 'self',
    description: 'Heals for 20-40% of max HP, costs 5 MP'
  });
  skillRegistry.register(heal);

  // Curse - costs 7 MP, deals 60-80% of enemy's max HP as damage
  const curse = SkillFactory.createPercentageSkill('curse', [60, 80], 7);
  skillRegistry.register(curse);

  // Block - defensive action that could reduce incoming damage
  const block = new Skill({
    name: 'block',
    type: 'defensive',
    mpCost: 0,
    target: 'self',
    description: 'Blocks and prepares for defense',
    effect: (caster, target, result) => {
      // For now, block doesn't have immediate effects but could be extended
      // to add a "blocking" status or damage reduction buff
      result.message = `${caster.name || 'Player'} blocks and prepares for defense!`;
      return result;
    }
  });
  skillRegistry.register(block);

  // Charge - gains 3-5 MP
  const charge = new Skill({
    name: 'charge',
    type: 'utility',
    mpCost: 0,
    target: 'self',
    description: 'Gains 3-5 MP',
    effect: (caster, target, result) => {
      const mpGain = Math.floor(Math.random() * 3) + 3; // 3-5 MP
      const maxMp = caster.maxMp || 10;
      caster.mp = Math.min(maxMp, caster.mp + mpGain);
      result.message = `${caster.name || 'Player'} charges and gains ${mpGain} MP!`;
      return result;
    }
  });
  skillRegistry.register(charge);

  console.log('Default skills registered:', skillRegistry.getAllSkills().map(s => s.name));
}

/**
 * Get a skill that demonstrates extensibility for future features
 */
export function createExampleAdvancedSkill() {
  // Example of a more complex skill that could be added later
  return new Skill({
    name: 'fireball',
    type: 'offensive',
    mpCost: 8,
    damage: { min: 30, max: 60 },
    target: 'enemy',
    description: 'A powerful fire attack that deals high damage',
    effect: (caster, target, result) => {
      // Could add burn status effect here in the future
      result.message = `${caster.name || 'Player'} casts Fireball for ${result.damage} damage!`;
      
      // Example: 10% chance to add a burn effect (placeholder for future status system)
      if (Math.random() < 0.1) {
        result.message += ' The target is burning!';
        // TODO: Apply burn status when status system is implemented
      }
      
      return result;
    }
  });
}