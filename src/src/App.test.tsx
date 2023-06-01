import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { Auth } from 'aws-amplify';

jest.mock('aws-amplify')

test('renders learn react link', () => {
  render(<App auth={Auth} />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
