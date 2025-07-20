/**
 * Skill Registry for managing and executing skills
 */
export class SkillRegistry {
  constructor() {
    this.skills = new Map();
  }

  /**
   * Register a skill in the registry
   */
  register(skill) {
    this.skills.set(skill.name.toLowerCase(), skill);
  }

  /**
   * Get a skill by name
   */
  getSkill(name) {
    return this.skills.get(name.toLowerCase());
  }

  /**
   * Check if a skill exists
   */
  hasSkill(name) {
    return this.skills.has(name.toLowerCase());
  }

  /**
   * Get all registered skills
   */
  getAllSkills() {
    return Array.from(this.skills.values());
  }

  /**
   * Get skills by type
   */
  getSkillsByType(type) {
    return Array.from(this.skills.values()).filter(skill => skill.type === type);
  }

  /**
   * Execute a skill by name
   */
  executeSkill(skillName, caster, target) {
    const skill = this.getSkill(skillName);
    
    if (!skill) {
      return {
        success: false,
        message: `Unknown skill: ${skillName}`,
        damage: 0,
        healing: 0
      };
    }

    // Calculate the base effect
    const result = skill.calculateEffect(caster, target);
    
    if (!result.success) {
      return result;
    }

    // Execute any custom effects
    const finalResult = skill.executeCustomEffect(caster, target, result);

    // Generate a message if one wasn't provided
    if (!finalResult.message) {
      finalResult.message = this.generateDefaultMessage(skill, caster, target, finalResult);
    }

    return finalResult;
  }

  /**
   * Generate a default message for skill execution
   */
  generateDefaultMessage(skill, caster, target, result) {
    const casterName = caster.name || 'Player';
    const targetName = target.name || 'Enemy';

    if (result.damage > 0) {
      return `${casterName} uses ${skill.name} and deals ${result.damage} damage to ${targetName}!`;
    }
    
    if (result.healing > 0) {
      return `${casterName} uses ${skill.name} and heals for ${result.healing} HP!`;
    }

    return `${casterName} uses ${skill.name}!`;
  }

  /**
   * Remove a skill from the registry
   */
  unregister(skillName) {
    return this.skills.delete(skillName.toLowerCase());
  }

  /**
   * Clear all skills
   */
  clear() {
    this.skills.clear();
  }
}

// Create and export a default instance
export const skillRegistry = new SkillRegistry();