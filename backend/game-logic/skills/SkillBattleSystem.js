import { skillDispatcher } from './SkillDispatcher.js';
import { skillRegistry } from './SkillRegistry.js';
import { registerDefaultSkills } from './DefaultSkills.js';

/**
 * Modern battle system using the new skill framework
 */
export class SkillBattleSystem {
  constructor() {
    // Initialize with default skills
    registerDefaultSkills();
  }

  /**
   * Execute a skill action between two players
   */
  async executeAction(caster, target, skillName) {
    // Validate the skill exists
    if (!skillRegistry.hasSkill(skillName)) {
      return {
        success: false,
        message: `Unknown skill: ${skillName}`,
        damage: 0,
        healing: 0
      };
    }

    // Execute the skill using the dispatcher
    const result = await skillDispatcher.executeSkill(skillName, caster, target);
    
    // Add the skill name to the result for reference
    result.skillName = skillName;
    result.action = skillName; // For compatibility with existing UI

    return result;
  }

  /**
   * Get available skills for a player (could be filtered by class, level, etc.)
   */
  getAvailableSkills(player) {
    return skillRegistry.getAllSkills().filter(skill => skill.canUse(player));
  }

  /**
   * Get skills by category
   */
  getSkillsByType(type) {
    return skillRegistry.getSkillsByType(type);
  }

  /**
   * Register a new skill
   */
  addSkill(skill) {
    skillRegistry.register(skill);
  }

  /**
   * Add a hook for game events (for future buff/debuff system)
   */
  addGameHook(event, hookFunction) {
    skillDispatcher.addHook(event, hookFunction);
  }

  /**
   * Check if a player has enough resources for a skill
   */
  canUseSkill(player, skillName) {
    const skill = skillRegistry.getSkill(skillName);
    return skill ? skill.canUse(player) : false;
  }

  /**
   * Get detailed information about a skill
   */
  getSkillInfo(skillName) {
    const skill = skillRegistry.getSkill(skillName);
    if (!skill) return null;

    return {
      name: skill.name,
      type: skill.type,
      mpCost: skill.mpCost,
      description: skill.description,
      target: skill.target
    };
  }

  /**
   * Backward compatibility method that mimics the old processGameAction function
   */
  async processGameAction(currentPlayer, opponent, action, value = null) {
    return await this.executeAction(currentPlayer, opponent, action);
  }
}

// Create and export a default instance
export const skillBattleSystem = new SkillBattleSystem();