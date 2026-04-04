import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a mock instance
const mock = new MockAdapter(axios);

// Mock the login API
mock.onPost('/api/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);

    if (email === 'test@example.com' && password === 'password123') {
        return [200, { success: true, data: { token: 'mock-token' } }];
    } else {
        return [401, { success: false, message: 'Invalid login credentials' }];
    }
});

// Mock other APIs as needed
mock.onAny().reply(404, { message: 'Not Found' });

export default mock;
