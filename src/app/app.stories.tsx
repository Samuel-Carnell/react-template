import React from 'react';
import { Story, Meta } from '@storybook/react';
import { App, AppProps } from './app';

export default {
	title: 'App',
	component: App
} as Meta<AppProps>;

const Template: Story<AppProps> = (args) => <App {...args} />;

export const Default: Story<AppProps> = Template.bind({});
Default.args = {
	name: 'My Awesome Application'
};
