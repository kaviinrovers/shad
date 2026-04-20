import { render, screen } from '@testing-library/react';
import Login from '../components/Auth';
import { AuthProvider } from '../context/AuthContext';

describe('Login component', () => {
  it('shows login form fields and switches to sign up mode', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});
