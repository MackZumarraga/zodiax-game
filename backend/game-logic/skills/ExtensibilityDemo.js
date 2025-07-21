import { Skill, SkillFactory, skillRegistry, skillBattleSystem } from './index.js';

/**
 * Demonstration of how to extend the skill system with new abilities
 * This shows the foundation for Phase 2-5 features
 */

// Example: Phase 2 - Buff/Debuff System Foundation
export function createBuffSkills() {
  // Attack boost skill - demonstrates future buff system integration
  const attackBoost = new Skill({
    name: 'attack_boost',
    type: 'support',
    mpCost: 4,
    target: 'self',
    description: 'Increases attack power for the next few turns',
    effect: (caster, target, result) => {
      // This would integrate with a future buff system
      result.message = `${caster.name} feels empowered! Attack increased!`;
      // TODO: Add attack buff when buff system is implemented
      // buffSystem.addBuff(caster, 'attackUp', { duration: 3, modifier: 1.5 });
      return result;
    }
  });

  // Defense boost skill
  const defenseBoost = new Skill({
    name: 'defense_boost',
    type: 'defensive',
    mpCost: 3,
    target: 'self',
    description: 'Increases defense for the next few turns',
    effect: (caster, target, result) => {
      result.message = `${caster.name} hardens their defenses!`;
      // TODO: Add defense buff when buff system is implemented
      return result;
    }
  });

  return [attackBoost, defenseBoost];
}

// Example: Phase 3 - Status Effects Foundation
export function createStatusEffectSkills() {
  // Poison skill - demonstrates future status effect system
  const poison = new Skill({
    name: 'poison',
    type: 'offensive',
    mpCost: 5,
    damage: { min: 15, max: 25 },
    target: 'enemy',
    description: 'Poisons the enemy, dealing damage over time',
    effect: (caster, target, result) => {
      result.message = `${caster.name} poisons ${target.name} for ${result.damage} damage!`;
      
      // Chance to apply poison status
      if (Math.random() < 0.7) {
        result.message += ' The target is poisoned!';
        // TODO: Apply poison status when status system is implemented
        // statusSystem.addStatus(target, 'poison', { duration: 3, damagePerTurn: 10 });
      }
      
      return result;
    }
  });

  // Sleep skill
  const sleep = new Skill({
    name: 'sleep',
    type: 'utility',
    mpCost: 6,
    target: 'enemy',
    description: 'Puts the enemy to sleep, preventing their next action',
    effect: (caster, target, result) => {
      const sleepChance = 0.6;
      if (Math.random() < sleepChance) {
        result.message = `${target.name} falls asleep!`;
        // TODO: Apply sleep status when status system is implemented
        // statusSystem.addStatus(target, 'sleep', { duration: 2 });
      } else {
        result.message = `${target.name} resists the sleep effect!`;
      }
      return result;
    }
  });

  return [poison, sleep];
}

// Example: Phase 4 - Conditional Skills
export function createConditionalSkills() {
  // Desperate strike - more powerful when HP is low
  const desperateStrike = new Skill({
    name: 'desperate_strike',
    type: 'offensive',
    mpCost: 3,
    damage: (caster, target) => {
      const hpPercent = (caster.hp / caster.maxHp) * 100;
      let baseDamage = 25;
      
      // More damage when HP is lower
      if (hpPercent < 30) {
        baseDamage = 60; // High damage when desperate
      } else if (hpPercent < 50) {
        baseDamage = 40; // Medium damage
      }
      
      return baseDamage + Math.floor(Math.random() * 15);
    },
    target: 'enemy',
    description: 'Deals more damage when caster has low HP',
    effect: (caster, target, result) => {
      const hpPercent = (caster.hp / caster.maxHp) * 100;
      let modifier = '';
      
      if (hpPercent < 30) {
        modifier = ' with desperate fury';
      } else if (hpPercent < 50) {
        modifier = ' with determination';
      }
      
      result.message = `${caster.name} strikes${modifier} for ${result.damage} damage!`;
      return result;
    }
  });

  // Execution - high damage against low HP enemies
  const execution = new Skill({
    name: 'execution',
    type: 'offensive',
    mpCost: 8,
    damage: (caster, target) => {
      const targetHpPercent = (target.hp / target.maxHp) * 100;
      
      if (targetHpPercent < 25) {
        return target.hp; // Instant kill if below 25% HP
      } else {
        return Math.floor(Math.random() * 30) + 20; // Normal damage otherwise
      }
    },
    target: 'enemy',
    description: 'Attempts to execute enemies with low HP',
    effect: (caster, target, result) => {
      const targetHpPercent = (target.hp / target.maxHp) * 100;
      
      if (targetHpPercent < 25 && result.damage >= target.hp) {
        result.message = `${caster.name} executes ${target.name}!`;
      } else {
        result.message = `${caster.name} attempts an execution for ${result.damage} damage!`;
      }
      
      return result;
    }
  });

  return [desperateStrike, execution];
}

// Example: Phase 5 - Event Hooks (Passive Skills)
export function createPassiveSkills() {
  // Counterattack - retaliates when damaged
  const counterattack = new Skill({
    name: 'counterattack',
    type: 'passive',
    mpCost: 0,
    target: 'self',
    description: 'Automatically counterattacks when taking damage',
    effect: (caster, target, result) => {
      result.message = `${caster.name} prepares to counterattack!`;
      
      // This would register an event hook in a real implementation
      // skillDispatcher.addHook('onDamage', (data) => {
      //   if (data.target === caster && Math.random() < 0.3) {
      //     // 30% chance to counterattack
      //     return skillBattleSystem.executeAction(caster, data.source, 'attack');
      //   }
      // });
      
      return result;
    }
  });

  return [counterattack];
}

// Demonstration function
export async function demonstrateExtensibility() {
  console.log('\n=== Skill System Extensibility Demo ===\n');

  // Register example advanced skills
  const buffSkills = createBuffSkills();
  const statusSkills = createStatusEffectSkills();
  const conditionalSkills = createConditionalSkills();
  const passiveSkills = createPassiveSkills();

  const allNewSkills = [...buffSkills, ...statusSkills, ...conditionalSkills, ...passiveSkills];
  
  allNewSkills.forEach(skill => {
    skillRegistry.register(skill);
  });

  console.log('Registered new skills:');
  allNewSkills.forEach(skill => {
    console.log(`- ${skill.name}: ${skill.description}`);
  });

  // Test some of the new skills
  const player = { name: 'Hero', hp: 20, mp: 15, maxHp: 100, maxMp: 15 };
  const enemy = { name: 'Monster', hp: 30, mp: 15, maxHp: 120, maxMp: 15 };

  console.log('\nTesting conditional skill (desperate_strike with low HP):');
  let result = await skillBattleSystem.executeAction(player, enemy, 'desperate_strike');
  console.log(result.message);

  console.log('\nTesting execution skill:');
  result = await skillBattleSystem.executeAction(player, enemy, 'execution');
  console.log(result.message);

  console.log('\nTesting status effect skill:');
  result = await skillBattleSystem.executeAction(player, enemy, 'poison');
  console.log(result.message);

  console.log('\nAll skills now in registry:');
  const allSkills = skillRegistry.getAllSkills();
  allSkills.forEach(skill => {
    console.log(`- ${skill.name} (${skill.type})`);
  });
}

// Run demo if this file is executed directly
if (import.meta.url === new URL(import.meta.resolve('./ExtensibilityDemo.js')).href) {
  demonstrateExtensibility().catch(console.error);
}