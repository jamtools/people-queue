# Springboard State Management Guide

This document explains how state management works in this Springboard application.

## Architecture Overview

This app uses Springboard's built-in state management system with three main components:

1. **Server States** (`app.createStates()`) - Shared state synchronized across all clients
2. **User Agent State** (`app.createUserAgentState()`) - Per-client state stored locally
3. **Server Actions** (`app.createActions()`) - Server-side functions that modify state

## Server States

Server states are created with `app.createStates()` and are synchronized across all connected clients:

```typescript
const states = await app.createStates({
    peopleQueue: [] as Participant[],
    currentPerformerId: null as string | null,
});
```

### Using States in Components

Access state in routes using the `.useState()` hook:

```typescript
app.registerRoute('/', {}, () => {
    const participants = states.peopleQueue.useState();
    const currentPerformerId = states.currentPerformerId.useState();

    return <MyComponent participants={participants} />;
});
```

### Modifying States

States should ONLY be modified within server actions, not directly in components:

```typescript
// ❌ WRONG - Don't modify state directly in components
const participants = states.peopleQueue.useState();
participants.push(newParticipant); // This won't work!

// ✅ CORRECT - Call a server action
const actions = app.createActions({
    addParticipant: async (args: AddParticipantArgs) => {
        states.peopleQueue.setStateImmer(queue => {
            queue.push(newParticipant);
        });
    }
});
```

## User Agent State

User agent state is per-client and stored in the browser:

```typescript
const userAgentState = await app.createUserAgentState({
    myParticipantId: null as string | null,
});
```

### When to Use User Agent State

Use user agent state for:
- User-specific data that shouldn't be shared
- Client preferences
- Tracking what the current user has done (e.g., which participant they created)

### Modifying User Agent State

User agent state is modified OUTSIDE of server actions, directly in components:

```typescript
app.registerRoute('/', {}, () => {
    const myParticipantId = userAgentState.myParticipantId.useState();

    return (
        <SignupPage
            onSetMyParticipantId={(id) => userAgentState.myParticipantId.setState(id)}
            myParticipantId={myParticipantId}
        />
    );
});
```

```typescript
// In component
const participantId = await onAddParticipant({ name, socialLinks });
onSetMyParticipantId(participantId); // Update user agent state directly
```

## Server Actions

Server actions are async functions that run on the server and can modify server state.

### Creating Resources with Type Inference

Use a `createResources` function to organize states and actions, then export inferred types:

```typescript
async function createResources(app: typeof springboard.modules[string]) {
    const states = await app.createStates({
        peopleQueue: [] as Participant[],
        currentPerformerId: null as string | null,
    });

    const userAgentState = await app.createUserAgentState({
        myParticipantId: null as string | null,
    });

    const actions = app.createActions({
        addParticipant: async (args: { name: string; socialLinks: SocialLink[] }) => {
            const newParticipant: Participant = {
                id: generateId(),
                name: args.name,
                socialLinks: args.socialLinks,
                order: states.peopleQueue.getState().length,
            };

            states.peopleQueue.setStateImmer(queue => {
                queue.push(newParticipant);
            });

            return newParticipant.id;
        },

        updateParticipant: async (args: { id: string; name: string; socialLinks: SocialLink[] }) => {
            states.peopleQueue.setStateImmer(queue => {
                const participant = queue.find(p => p.id === args.id);
                if (participant) {
                    participant.name = args.name;
                    participant.socialLinks = args.socialLinks;
                }
            });
        },
    });

    return { states, actions, userAgentState };
}

// Export inferred type
export type Actions = Awaited<ReturnType<typeof createResources>>['actions'];
```

### Action Requirements

1. **Single Argument**: Actions must accept exactly ONE argument (an object)
2. **Inline Types**: Use inline object types for arguments (no need for separate type definitions)
3. **Async**: Actions are always async functions
4. **Return Values**: Actions can return values to the caller

```typescript
// ✅ CORRECT - Single object argument with inline type
const actions = app.createActions({
    addParticipant: async (args: { name: string; socialLinks: SocialLink[] }) => {
        // Implementation
        return newParticipant.id;
    }
});

// ❌ WRONG - Multiple arguments
const actions = app.createActions({
    addParticipant: async (name: string, socialLinks: SocialLink[]) => {
        // This won't work!
    }
});
```

### Using Actions in Components

Import the inferred `Actions` type and use `Pick` to select only needed actions:

```typescript
// In component file
import type { Actions } from '../index';

type BackstagePageProps = {
    participants: Participant[];
    currentPerformerId: string | null;
    actions: Pick<Actions, 'updateParticipant' | 'removeParticipant' | 'setCurrentPerformer'>;
};

export function BackstagePage({ participants, currentPerformerId, actions }: BackstagePageProps) {
    // Use actions
    await actions.updateParticipant({
        id: editingId,
        name: editName,
        socialLinks: editLinks,
    });
}
```

### Passing Actions from Routes

Pass the entire actions object (or subset) as a single prop:

```typescript
// In route
app.registerRoute('/backstage', {}, () => {
    const participants = states.peopleQueue.useState();
    const currentPerformerId = states.currentPerformerId.useState();

    return (
        <BackstagePage
            participants={participants}
            currentPerformerId={currentPerformerId}
            actions={actions}  // Pass all actions as one prop
        />
    );
});
```

## State Modification Methods

### setStateImmer()

Use Immer-style mutations for complex state updates:

```typescript
states.peopleQueue.setStateImmer(queue => {
    queue.push(newParticipant);
    queue.forEach((p, i) => {
        p.order = i;
    });
});
```

### setState()

Use direct replacement for simple updates:

```typescript
states.currentPerformerId.setState(args.id);

// Or replace entire array
states.peopleQueue.setState(
    args.participants.map((p, index) => ({ ...p, order: index }))
);
```

### getState()

Read current state value (only use within actions):

```typescript
const actions = app.createActions({
    addParticipant: async (args: AddParticipantArgs) => {
        const currentLength = states.peopleQueue.getState().length;
        // Use currentLength...
    }
});
```

## Common Patterns

### Pattern 1: Create and Return ID

```typescript
const actions = app.createActions({
    addParticipant: async (args: AddParticipantArgs) => {
        const newParticipant: Participant = {
            id: generateId(),
            ...args,
            order: states.peopleQueue.getState().length,
        };

        states.peopleQueue.setStateImmer(queue => {
            queue.push(newParticipant);
        });

        return newParticipant.id; // Return for user agent state
    }
});

// In component
const participantId = await onAddParticipant({ name, socialLinks });
onSetMyParticipantId(participantId); // Store in user agent state
```

### Pattern 2: Find and Update

```typescript
const actions = app.createActions({
    updateParticipant: async (args: UpdateParticipantArgs) => {
        states.peopleQueue.setStateImmer(queue => {
            const participant = queue.find(p => p.id === args.id);
            if (participant) {
                participant.name = args.name;
                participant.socialLinks = args.socialLinks;
            }
        });
    }
});
```

### Pattern 3: Remove and Reorder

```typescript
const actions = app.createActions({
    removeParticipant: async (args: RemoveParticipantArgs) => {
        states.peopleQueue.setStateImmer(queue => {
            const index = queue.findIndex(p => p.id === args.id);
            if (index !== -1) {
                queue.splice(index, 1);
                // Reorder remaining items
                queue.forEach((p, i) => {
                    p.order = i;
                });
            }
        });

        // Update related state
        if (states.currentPerformerId.getState() === args.id) {
            states.currentPerformerId.setState(null);
        }
    }
});
```

### Pattern 4: Reorder Array

```typescript
const actions = app.createActions({
    reorderParticipants: async (args: ReorderParticipantsArgs) => {
        states.peopleQueue.setState(
            args.participants.map((p, index) => ({ ...p, order: index }))
        );
    }
});

// In component - swap two items
const handleMoveUp = (id: string) => {
    const index = participants.findIndex(p => p.id === id);
    if (index > 0) {
        const newParticipants = [...participants];
        [newParticipants[index - 1], newParticipants[index]] =
            [newParticipants[index], newParticipants[index - 1]];
        onReorderParticipants({ participants: newParticipants });
    }
};
```

## Key Rules Summary

1. ✅ Create resources in a `createResources` function that returns `{ states, actions, userAgentState }`
2. ✅ Export inferred types: `export type Actions = Awaited<ReturnType<typeof createResources>>['actions']`
3. ✅ Access state in routes with `.useState()` hook
4. ✅ Modify server state ONLY in server actions
5. ✅ Actions take exactly ONE argument (an inline object type)
6. ✅ Actions are async and can return values
7. ✅ Use `setStateImmer()` for complex mutations
8. ✅ Use `setState()` for simple replacements
9. ✅ User agent state is modified directly (not in actions)
10. ✅ Pass actions as a single prop to components
11. ✅ Use `Pick<Actions, 'action1' | 'action2'>` to type action props
12. ✅ Import action types with `import type { Actions } from '../index'`
