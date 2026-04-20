import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the login screen when unauthenticated', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: /welcome to shadhee/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });
});
