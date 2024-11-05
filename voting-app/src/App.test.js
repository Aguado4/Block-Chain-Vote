import { render, screen } from '@testing-library/react';
import App from './App';

// Prueba que verifica si el componente App renderiza correctamente.
test('renders learn react link', () => {
  // Renderiza el componente `App` en el entorno de prueba.
  render(<App />);

  // Busca un elemento que contenga el texto learn react.
  const linkElement = screen.getByText(/learn react/i);

  // Verifica si linkElement está presente en el documento.
  expect(linkElement).toBeInTheDocument();
});
