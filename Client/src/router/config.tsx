import type { RouteObject } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import Home from '../pages/home/page';
import Menu from '../pages/menu/page';
import Cart from '../pages/cart/page';
import Checkout from '../pages/checkout/page';
import Payment from '../pages/payment/page';
import OrderStatus from '../pages/order-status/page';
import Feedback from '../pages/feedback/page';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/menu',
    element: <Menu />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: '/payment',
    element: <Payment />,
  },
  {
    path: '/order-status',
    element: <OrderStatus />,
  },
  {
    path: '/feedback',
    element: <Feedback />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;