const { addDecorator } = require('@storybook/react');
const { withA11y } = require('@storybook/addon-a11y');
const { withKnobs } = require('@storybook/addon-knobs');

addDecorator(withA11y);
addDecorator(withKnobs);
