import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create an Axios instance
const httpClient = axios.create({
    baseURL: '/api', // Adjust this base URL to match your actual setup
    timeout: 1000,
});

// Create a MockAdapter instance
const mock = new MockAdapter(httpClient);

// Mock login
mock.onPost('/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);

    if (email === 'admin@koraspond.com' && password === 'koraspondAdmin')
    {
        return [200, { success: true, data: { token: '9wzbHzlvzJVYJk7v2IItqSQEdgH8MBHbdXUXKx1WjaL1GuD89fUTUMcSyF28SKX0',name:'Bilal Admin',role:'admin' } }];
    }
    return [401, { success: false, message: 'Invalid credentials' }];
});

// Mock logout
mock.onPost('/auth/logout').reply(200, { success: true, message: 'Logged out successfully' });

// Mock user profile
mock.onGet('/auth/profile').reply(200, {
    success: true,
    data: {
        id: 1,
        name: 'John Doe',
        email: 'test@example.com',
    },
});

export default httpClient;
