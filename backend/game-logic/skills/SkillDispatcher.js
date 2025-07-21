import { skillRegistry } from './SkillRegistry.js';

/**
 * Skill Dispatcher - handles the application of skill effects to players
 */
export class SkillDispatcher {
  constructor() {
    this.hooks = {
      beforeSkillUse: [],
      afterSkillUse: [],
      onDamage: [],
      onHealing: []
    };
  }

  /**
   * Execute a skill and apply its effects
   */
  async executeSkill(skillName, caster, target, gameState = null) {
    // Execute beforeSkillUse hooks
    await this.executeHooks('beforeSkillUse', { skillName, caster, target, gameState });

    // Get the skill execution result
    const result = skillRegistry.executeSkill(skillName, caster, target);
    
    // Add skill name to result for reference
    result.skillName = skillName;

    if (!result.success) {
      return result;
    }

    // Apply the skill effects
    await this.applySkillEffects(result, caster, target, gameState);

    // Execute afterSkillUse hooks
    await this.executeHooks('afterSkillUse', { skillName, caster, target, result, gameState });

    return result;
  }

  /**
   * Apply the calculated skill effects to the targets
   */
  async applySkillEffects(result, caster, target, gameState) {
    const skill = skillRegistry.getSkill(result.skillName || 'unknown');

    // Deduct MP cost
    if (result.mpCost > 0) {
      caster.mp = Math.max(0, caster.mp - result.mpCost);
    }

    // Apply damage
    if (result.damage > 0) {
      const targetToHit = skill?.target === 'self' ? caster : target;
      let actualDamage = result.damage;
      
      // Check for blocking (50% damage reduction)
      if (targetToHit.isBlocking) {
        actualDamage = Math.floor(actualDamage * 0.5);
        result.message += ` (${targetToHit.name || 'Target'} blocked for 50% damage reduction!)`;
        
        // Damage reflection (25% of original damage back to attacker)
        if (targetToHit.reflectDamage) {
          const reflectedDamage = Math.floor(result.damage * 0.25);
          caster.hp = Math.max(0, caster.hp - reflectedDamage);
          result.message += ` Reflected ${reflectedDamage} damage back to ${caster.name || 'Attacker'}!`;
        }
        
        // Clear blocking status after use
        targetToHit.isBlocking = false;
        targetToHit.reflectDamage = false;
      }
      
      targetToHit.hp = Math.max(0, targetToHit.hp - actualDamage);
      
      // Execute damage hooks
      await this.executeHooks('onDamage', { 
        damage: actualDamage, 
        originalDamage: result.damage,
        target: targetToHit, 
        source: caster, 
        gameState 
      });
    }

    // Apply healing
    if (result.healing > 0) {
      const targetToHeal = skill?.target === 'enemy' ? target : caster;
      const maxHp = targetToHeal.maxHp || 100;
      targetToHeal.hp = Math.min(maxHp, targetToHeal.hp + result.healing);
      
      // Execute healing hooks
      await this.executeHooks('onHealing', { 
        healing: result.healing, 
        target: targetToHeal, 
        source: caster, 
        gameState 
      });
    }

    return result;
  }

  /**
   * Add a hook for specific events
   */
  addHook(event, hookFunction) {
    if (this.hooks[event]) {
      this.hooks[event].push(hookFunction);
    }
  }

  /**
   * Remove a hook
   */
  removeHook(event, hookFunction) {
    if (this.hooks[event]) {
      const index = this.hooks[event].indexOf(hookFunction);
      if (index > -1) {
        this.hooks[event].splice(index, 1);
      }
    }
  }

  /**
   * Execute all hooks for a specific event
   */
  async executeHooks(event, data) {
    if (this.hooks[event]) {
      for (const hook of this.hooks[event]) {
        try {
          await hook(data);
        } catch (error) {
          console.error(`Error executing ${event} hook:`, error);
        }
      }
    }
  }

  /**
   * Clear all hooks
   */
  clearHooks() {
    Object.keys(this.hooks).forEach(event => {
      this.hooks[event] = [];
    });
  }

  /**
   * Static helper method for quick skill execution
   */
  static async execute(skillName, caster, target, gameState = null) {
    const dispatcher = new SkillDispatcher();
    return await dispatcher.executeSkill(skillName, caster, target, gameState);
  }
}

// Create and export a default instance
export const skillDispatcher = new SkillDispatcher();