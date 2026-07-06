import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { AppRoutes } from './router';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </I18nextProvider>
  );
}

export default App;