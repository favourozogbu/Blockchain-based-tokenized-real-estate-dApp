// Import the necessary functions from the testing library
import { render, screen } from '@testing-library/react';
// Import the App component that needs to be tested
import App from './App';

// Define a test case 
test('renders learn react link', () => {
  // Render the App component in a virtual DOM for testing
  render(<App />);
  // Use the 'screen' object to query the virtual DOM for text that matches the regex /learn react/i
  const linkElement = screen.getByText(/learn react/i);
  // Assert that the element containing 'learn react' text is present in the document
  expect(linkElement).toBeInTheDocument();
});
