# Skill System Documentation

A flexible, modular skill system for the Zodiax turn-based game that replaces the hardcoded attack/heal/curse/block commands with an extensible framework.

## 🎯 Features Completed (Phase 1)

### ✅ Core Skill System
- **Skill Class**: Abstract skill representation with name, type, MP cost, damage, healing, and custom effects
- **Skill Factory**: Helper methods for creating common skill types
- **Skill Registry**: Central management of all available skills
- **Skill Dispatcher**: Handles skill execution and effect application
- **Event Hooks**: Foundation for buff/debuff and status effect systems

### ✅ Backward Compatibility
All existing commands now use the new skill system:
- `attack` - 1-49 damage, 0 MP cost
- `heal` - 20-40% max HP healing, 5 MP cost  
- `curse` - 60-80% enemy max HP damage, 7 MP cost
- `block` - Defensive preparation, 0 MP cost
- `charge` - Gain 3-5 MP, 0 MP cost

## 📁 File Structure

```
/game-logic/skills/
├── Skill.js              # Core Skill class and SkillFactory
├── SkillRegistry.js      # Skill registration and management
├── SkillDispatcher.js    # Skill execution and effect application
├── SkillBattleSystem.js  # High-level battle system integration
├── DefaultSkills.js      # Registration of existing game skills
├── ExtensibilityDemo.js  # Examples of future skill types
├── test-skills.js        # Test suite for the skill system
├── index.js              # Main exports
└── README.md             # This documentation
```

## 🚀 Quick Start

```javascript
import { skillBattleSystem } from './game-logic/skills/index.js';

// Execute a skill between two players
const result = await skillBattleSystem.executeAction(caster, target, 'attack');
console.log(result.message); // "Alice attacks Bob for 35 damage!"

// Check if a player can use a skill
const canHeal = skillBattleSystem.canUseSkill(player, 'heal');

// Get skill information
const healInfo = skillBattleSystem.getSkillInfo('heal');
console.log(healInfo.description); // "Heals for 20-40% of max HP, costs 5 MP"
```

## 🔧 Creating New Skills

### Basic Attack Skill
```javascript
import { SkillFactory, skillRegistry } from './skills/index.js';

const fireball = SkillFactory.createAttackSkill('fireball', { min: 30, max: 50 }, 8);
skillRegistry.register(fireball);
```

### Custom Effect Skill
```javascript
import { Skill } from './skills/index.js';

const vampiricStrike = new Skill({
  name: 'vampiric_strike',
  type: 'offensive',
  mpCost: 6,
  damage: { min: 20, max: 35 },
  target: 'enemy',
  description: 'Attack that heals the caster',
  effect: (caster, target, result) => {
    // Heal caster for half the damage dealt
    const healing = Math.floor(result.damage / 2);
    caster.hp = Math.min(caster.maxHp, caster.hp + healing);
    result.message = `${caster.name} drains ${result.damage} HP and heals for ${healing}!`;
    return result;
  }
});
```

## 🔮 Future Extension Points (Phases 2-5)

### Phase 2: Buff/Debuff System
The foundation is ready for buffs/debuffs:
```javascript
// Example: Attack boost buff (implementation ready)
const attackBoost = new Skill({
  name: 'attack_boost',
  effect: (caster, target, result) => {
    // TODO: Add when buff system is implemented
    // buffSystem.addBuff(caster, 'attackUp', { duration: 3, modifier: 1.5 });
    return result;
  }
});
```

### Phase 3: Status Effects
Event hooks support status effects:
```javascript
// Example: Poison effect (framework ready)
const poison = new Skill({
  effect: (caster, target, result) => {
    // TODO: Add when status system is implemented  
    // statusSystem.addStatus(target, 'poison', { duration: 3, damagePerTurn: 10 });
    return result;
  }
});
```

### Phase 4: Conditional Skills
Skills can already check conditions:
```javascript
// Example: Conditional damage based on HP
damage: (caster, target) => {
  const hpPercent = (caster.hp / caster.maxHp) * 100;
  return hpPercent < 30 ? 80 : 40; // More damage when low HP
}
```

### Phase 5: Event Hooks & Triggers
The dispatcher supports event hooks:
```javascript
// Example: Counterattack on damage taken
skillDispatcher.addHook('onDamage', async (data) => {
  if (data.target.hasCounterattack && Math.random() < 0.3) {
    return await skillBattleSystem.executeAction(data.target, data.source, 'attack');
  }
});
```

## 🧪 Testing

Run the test suite:
```bash
node game-logic/skills/test-skills.js
```

Run the extensibility demo:
```bash
node game-logic/skills/ExtensibilityDemo.js
```

## 🔄 Integration

The skill system is fully integrated with your existing game:

1. **Socket.IO Multiplayer** (`index.js`): Uses `skillBattleSystem.processGameAction()`
2. **Battle Simulator** (`battleSimulator.js`): Uses `skillBattleSystem.executeAction()`
3. **HTTP API** (`battleController.js`): Compatible with existing endpoints

## 📈 Performance

- **Zero Breaking Changes**: All existing game functionality preserved
- **Async Support**: Ready for database operations and complex effects
- **Modular Design**: Only load skills you need
- **Event System**: Efficient hook-based architecture for future features

## 🎮 Example Advanced Skills

See `ExtensibilityDemo.js` for examples of:
- **Conditional Skills**: Desperate Strike (more damage at low HP)
- **Status Effects**: Poison (damage over time)
- **Execution Skills**: High damage against low HP enemies  
- **Passive Skills**: Counterattack on damage taken
- **Buff Skills**: Attack/Defense boosts

The system is ready for any type of RPG skill you can imagine!