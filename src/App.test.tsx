import React from 'react';
import { render } from '@testing-library/react';
import MpgApp from './MpgApp';

test('renders learn react link', () => {
  const { getByText } = render(<MpgApp />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
