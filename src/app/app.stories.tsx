import React from 'react';
import App from './app';
import { text } from '@storybook/addon-knobs';

export default {
	title: 'Application',
	component: App,
};

export const Default = (): JSX.Element => {
	return <App name={text('App Name', 'My Awesome Project')}/>;
};