import React from 'react';
import { shallow } from 'enzyme';
import App from './app';

it('Renders learn react link', () => {
	const app = shallow(<App />);
	expect(app.find('.App-link')).toHaveText('Learn React');
});
