import { skillBattleSystem, SkillFactory, skillRegistry } from './index.js';

// Test the skill system
async function testSkillSystem() {
  console.log('Testing Skill System...\n');

  // Create test players
  const player1 = {
    name: 'Alice',
    hp: 100,
    mp: 15,
    maxHp: 100,
    maxMp: 15
  };

  const player2 = {
    name: 'Bob',
    hp: 100,
    mp: 15,
    maxHp: 100,
    maxMp: 15
  };

  console.log('Initial state:');
  console.log(`${player1.name}: HP=${player1.hp}, MP=${player1.mp}`);
  console.log(`${player2.name}: HP=${player2.hp}, MP=${player2.mp}\n`);

  // Test attack
  console.log('Testing Attack...');
  let result = await skillBattleSystem.executeAction(player1, player2, 'attack');
  console.log(result.message);
  console.log(`${player2.name} HP after attack: ${player2.hp}\n`);

  // Test heal
  console.log('Testing Heal...');
  player1.hp = 50; // Reduce HP to test healing
  result = await skillBattleSystem.executeAction(player1, player2, 'heal');
  console.log(result.message);
  console.log(`${player1.name} HP after heal: ${player1.hp}, MP: ${player1.mp}\n`);

  // Test curse
  console.log('Testing Curse...');
  result = await skillBattleSystem.executeAction(player1, player2, 'curse');
  console.log(result.message);
  console.log(`${player1.name} MP after curse: ${player1.mp}`);
  console.log(`${player2.name} HP after curse: ${player2.hp}\n`);

  // Test insufficient MP
  console.log('Testing insufficient MP for heal...');
  player1.mp = 3; // Not enough for heal
  result = await skillBattleSystem.executeAction(player1, player2, 'heal');
  console.log(result.message);
  console.log(`${player1.name} MP: ${player1.mp}\n`);

  // Test charge
  console.log('Testing Charge...');
  result = await skillBattleSystem.executeAction(player1, player2, 'charge');
  console.log(result.message);
  console.log(`${player1.name} MP after charge: ${player1.mp}\n`);

  // Test block
  console.log('Testing Block...');
  result = await skillBattleSystem.executeAction(player1, player2, 'block');
  console.log(result.message);

  // List all available skills
  console.log('\nAvailable skills:');
  const allSkills = skillRegistry.getAllSkills();
  allSkills.forEach(skill => {
    console.log(`- ${skill.name}: ${skill.description} (Type: ${skill.type}, MP Cost: ${skill.mpCost})`);
  });

  console.log('\nSkill system test completed!');
}

// Run the test if this file is executed directly
if (import.meta.url === new URL(import.meta.resolve('./test-skills.js')).href) {
  testSkillSystem().catch(console.error);
}