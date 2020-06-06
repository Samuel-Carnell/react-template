import React from 'react';
import { shallow } from 'enzyme';
import App from './app';

it('Renders the app name', () => {
	const app = shallow(<App name="test" />);
	expect(app.find('#app-name')).toHaveText('test');
});
