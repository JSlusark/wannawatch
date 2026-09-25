// Meta - used to define the metadata for the component
// StoryObj - used to define individual stories for that component.
// Both let your editor warn you if you type a prop that doesn't exist
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './Button';

// Meta is the button.tsx file default export that is built on the button primitive component. 
const meta = {
    component: Button,
} satisfies Meta<typeof Button>; // asserts this is a valid meta for Button

export default meta; // export default meta to storybook, so it knows this file is about Button

// stores the type of the component's props, to ensure every story below only uses 'Button' 's real props
type Story = StoryObj<typeof meta>;

// Each story is one state of a component. 
// Can be defned as many stories as you want, each with different props.

export const Primary: Story = {
    // args are the closing tags of the component (<Button></Button>) and passed to the story as ptops
    args: { // is the tag <Button></Button> with props below
        variant: 'default', //<Button variant="default"></Button>
        children: 'Main button', //<Button>Children</Button>
        // not only can use props of the button metaobject but also of the actual button primitive component (like 'disabled' or 'onClick)
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Sidekick',
    },
};

export const Destructive : Story = {
    args: {
        variant: 'destructive',
        children: 'Destroy',
    },
};


export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Empty',
    },
};

export const Pill: Story = {
    args: {
        variant: 'pill',
        children: 'swallow',
    },
};




