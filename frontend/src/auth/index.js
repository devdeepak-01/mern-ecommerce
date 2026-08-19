import { API } from '../config';

export const signup = (user) => {
  return fetch(`${API}/signup`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const signin = (user) => {
  return fetch(`${API}/signin`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log(err);
    });
};

export const authenticate = (data, next, portal = 'customer') => {
  if (typeof window !== 'undefined') {
    const key = portal === 'admin' ? 'jwt_admin' : 'jwt_customer';
    localStorage.setItem(key, JSON.stringify(data));
    next();
  }
};

export const signout = (next, portal = 'customer') => {
  if (typeof window !== 'undefined') {
    const key = portal === 'admin' ? 'jwt_admin' : 'jwt_customer';
    localStorage.removeItem(key);
    next();
    return fetch(`${API}/signout`, {
      method: 'GET',
    })
      .then((response) => {
        console.log('signout', response);
      })
      .catch((err) => console.log(err));
  }
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const auth = localStorage.getItem('jwt_customer');
  if (!auth) return false;

  try {
    const parsedAuth = JSON.parse(auth);
    return parsedAuth?.user && parsedAuth?.token ? parsedAuth : false;
  } catch {
    localStorage.removeItem('jwt_customer');
    return false;
  }
};

export const isAuthenticatedAdmin = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const auth = localStorage.getItem('jwt_admin');
  if (!auth) return false;

  try {
    const parsedAuth = JSON.parse(auth);
    return parsedAuth?.user && parsedAuth?.token ? parsedAuth : false;
  } catch {
    localStorage.removeItem('jwt_admin');
    return false;
  }
};
