/**
 * Base Skill class representing an action in the game
 */
export class Skill {
  constructor({
    name,
    type = 'offensive', // 'offensive', 'defensive', 'support', 'utility'
    mpCost = 0,
    damage = null,
    healing = null,
    target = 'enemy', // 'enemy', 'self', 'both'
    description = '',
    effect = null // Custom effect function
  }) {
    this.name = name;
    this.type = type;
    this.mpCost = mpCost;
    this.damage = damage;
    this.healing = healing;
    this.target = target;
    this.description = description;
    this.effect = effect;
  }

  /**
   * Check if the skill can be used by the caster
   */
  canUse(caster) {
    return caster.mp >= this.mpCost;
  }

  /**
   * Calculate the actual effect values (for random ranges)
   */
  calculateEffect(caster, target) {
    const result = {
      damage: 0,
      healing: 0,
      mpCost: this.mpCost,
      message: '',
      success: false
    };

    // Check MP requirements
    if (!this.canUse(caster)) {
      result.message = `Not enough MP to use ${this.name}!`;
      return result;
    }

    // Calculate damage if present
    if (this.damage) {
      if (typeof this.damage === 'object' && this.damage.min && this.damage.max) {
        result.damage = Math.floor(Math.random() * (this.damage.max - this.damage.min + 1)) + this.damage.min;
      } else if (typeof this.damage === 'function') {
        result.damage = this.damage(caster, target);
      } else {
        result.damage = this.damage;
      }
    }

    // Calculate healing if present
    if (this.healing) {
      if (typeof this.healing === 'object' && this.healing.min && this.healing.max) {
        result.healing = Math.floor(Math.random() * (this.healing.max - this.healing.min + 1)) + this.healing.min;
      } else if (typeof this.healing === 'function') {
        result.healing = this.healing(caster, target);
      } else {
        result.healing = this.healing;
      }
    }

    result.success = true;
    return result;
  }

  /**
   * Execute the skill's custom effect if present
   */
  executeCustomEffect(caster, target, result) {
    if (this.effect && typeof this.effect === 'function') {
      return this.effect(caster, target, result);
    }
    return result;
  }
}

/**
 * Skill factory for creating common skill types
 */
export class SkillFactory {
  static createAttackSkill(name, damageRange, mpCost = 0) {
    return new Skill({
      name,
      type: 'offensive',
      mpCost,
      damage: damageRange,
      target: 'enemy',
      description: `Attacks the enemy for ${damageRange.min}-${damageRange.max} damage`
    });
  }

  static createHealSkill(name, healingRange, mpCost) {
    return new Skill({
      name,
      type: 'support',
      mpCost,
      healing: healingRange,
      target: 'self',
      description: `Heals for ${healingRange.min}-${healingRange.max} HP`
    });
  }

  static createPercentageSkill(name, damagePercent, mpCost) {
    return new Skill({
      name,
      type: 'offensive',
      mpCost,
      damage: (caster, target) => {
        const percent = Array.isArray(damagePercent) 
          ? Math.random() * (damagePercent[1] - damagePercent[0]) + damagePercent[0]
          : damagePercent;
        return Math.floor(target.maxHp * (percent / 100));
      },
      target: 'enemy',
      description: `Deals ${Array.isArray(damagePercent) ? damagePercent.join('-') : damagePercent}% of enemy's max HP as damage`
    });
  }

  static createUtilitySkill(name, effect, mpCost = 0) {
    return new Skill({
      name,
      type: 'utility',
      mpCost,
      target: 'self',
      effect,
      description: `${name} utility skill`
    });
  }
}