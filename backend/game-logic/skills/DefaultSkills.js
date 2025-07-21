import { Skill, SkillFactory } from './Skill.js';
import { skillRegistry } from './SkillRegistry.js';

/**
 * Register all default skills that match the current game mechanics
 */
export function registerDefaultSkills() {
  // Attack - deals 1-35 damage (reduced for better balance)
  const attack = SkillFactory.createAttackSkill('attack', { min: 1, max: 35 }, 0);
  skillRegistry.register(attack);

  // Heal - costs 6 MP, heals 20-40% of max HP
  const heal = new Skill({
    name: 'heal',
    type: 'support',
    mpCost: 6,
    healing: (caster, target) => {
      const healPercent = Math.floor(Math.random() * 21) + 20; // 20-40%
      return Math.floor(caster.maxHp * (healPercent / 100));
    },
    target: 'self',
    description: 'Heals for 20-40% of max HP, costs 6 MP'
  });
  skillRegistry.register(heal);

  // Curse - costs 6 MP, deals 25-40% of enemy's max HP as damage
  const curse = SkillFactory.createPercentageSkill('curse', [25, 40], 6);
  skillRegistry.register(curse);

  // Block - defensive action with damage reflection
  const block = new Skill({
    name: 'block',
    type: 'defensive',
    mpCost: 0,
    target: 'self',
    description: 'Blocks incoming damage (50% reduction + 25% reflection)',
    effect: (caster, target, result) => {
      // Set blocking status for damage reduction and reflection
      caster.isBlocking = true;
      caster.reflectDamage = true;
      result.message = `${caster.name || 'Player'} blocks and prepares for defense with damage reflection!`;
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
    description: 'Gains 2-3 MP',
    effect: (caster, target, result) => {
      const mpGain = Math.floor(Math.random() * 2) + 2; // 2-3 MP (reduced)
      const maxMp = caster.maxMp || 15;
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