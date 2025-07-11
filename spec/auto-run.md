# Auto-Run Feature UX Specification

## Current State Analysis

Currently, the AI query generation flow requires two separate actions:

1. User types a natural language query → AI generates SQL
2. User manually clicks "Run" button → SQL executes

This creates friction in the user experience, especially for exploratory querying.

## UX Design Options

### Option A: Split Button with Default Auto-Run

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Ask AI                                                  │
├─────────────────────────────────────────────────────────────┤
│  [Input: "show me all users from last week"            ] │ │
│                                              ┌─────────┐│ │
│                                              │Generate ││▼│
│                                              │& Run    ││ │
│                                              └─────────┘│ │
│                                                         │ │
└─────────────────────────────────────────────────────────────┘

Dropdown options:
• Generate & Run (default)
• Generate Only
```

### Option B: Toggle Switch with Auto-Run Default

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Ask AI                            Auto-run: [●] ON     │
├─────────────────────────────────────────────────────────────┤
│  [Input: "show me all users from last week"            ] │ │
│                                              ┌─────────┐│ │
│                                              │Generate ││ │
│                                              │         ││ │
│                                              └─────────┘│ │
│                                                         │ │
└─────────────────────────────────────────────────────────────┘

When ON: Generate button becomes "Generate & Run"
When OFF: Generate button shows "Generate"
```

### Option C: Contextual Button Text with Hold-to-Modify

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Ask AI                                                  │
├─────────────────────────────────────────────────────────────┤
│  [Input: "show me all users from last week"            ] │ │
│                                              ┌─────────┐│ │
│                                              │Generate ││ │
│                                              │& Run    ││ │
│                                              └─────────┘│ │
│                                                         │ │
└─────────────────────────────────────────────────────────────┘

Default: "Generate & Run"
Shift + Enter/Click: "Generate Only" (shown via tooltip)
Button changes to "Generate" when Shift is held
```

### Option D: Checkbox with Persistent Setting

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Ask AI                                                  │
├─────────────────────────────────────────────────────────────┤
│  [Input: "show me all users from last week"            ] │ │
│  ☑ Auto-run generated queries           ┌─────────┐│ │
│                                              │Generate ││ │
│                                              │         ││ │
│                                              └─────────┘│ │
│                                                         │ │
└─────────────────────────────────────────────────────────────┘

Setting persists across sessions in user preferences
Button text changes based on checkbox state
```

## Behavioral Details

### Default Behavior

- **Auto-run enabled by default** for seamless experience
- First-time users see immediate results without extra clicks
- Experienced users can opt for generate-only when needed

### Error Handling

- If auto-run fails, query remains in editor for manual adjustment
- User can modify and manually run
- Error toast includes "Edit and run manually" action

### Performance Considerations

- Auto-run only triggers for successful query generation
- Maintain existing query validation before execution
- Preserve current loading states and indicators

## Recommended Option: Option B (Toggle Switch)

**Reasoning:**

1. **Clear Visual Indicator**: Toggle clearly shows current auto-run state
2. **Persistent Choice**: Users can set preference and keep it
3. **Minimal Cognitive Load**: Simple on/off decision
4. **Familiar Pattern**: Toggle switches are well-understood UI elements
5. **Space Efficient**: Doesn't significantly expand the interface
6. **Flexible**: Easy to change behavior per query when needed

**Implementation Benefits:**

- Clean integration with existing AI chat component
- State can be stored in user preferences
- Button text reactively updates based on toggle state
- Maintains existing keyboard shortcuts (Enter to trigger)

## Alternative Recommendation: Option C (Hold-to-Modify)

**If toggle feels too prominent:**

- Keeps interface minimal
- Power-user friendly (Shift modifier is common pattern)
- Default behavior favors the common use case
- Advanced users discover the modifier naturally

## User Flow with Recommended Option

1. User types natural language query
2. Sees "Auto-run: ON" toggle (default state)
3. Presses Enter or clicks "Generate & Run"
4. Query generates and immediately executes
5. Results appear without additional interaction

When user wants generate-only:

1. Toggles "Auto-run" to OFF
2. Button changes to "Generate"
3. Query generates but doesn't execute
4. User can review/edit before manual run
