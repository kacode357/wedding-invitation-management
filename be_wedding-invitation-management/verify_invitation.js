const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'test123';

async function verify() {
    try {
        console.log('1. Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.data.token;
        console.log('✓ Login successful');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('2. Creating a test guest...');
        const guestRes = await axios.post(`${API_URL}/guests`, {
            guestName: 'Test Verification Guest',
            numberOfGuests: 2
        }, config);
        const guest = guestRes.data.data.guest;
        console.log(`✓ Guest created with ID: ${guest._id}`);
        console.log(`  Initial Invitation ID: ${guest.invitationId}`);

        console.log('3. Calling create invitation endpoint...');
        const inviteRes = await axios.put(`${API_URL}/guests/${guest._id}/invitation/create`, {}, config);
        const updatedGuest = inviteRes.data.data.guest;

        console.log('✓ Invitation created successfully');
        console.log(`  isInvitationCreated: ${updatedGuest.isInvitationCreated}`);
        console.log(`  invitationId: ${updatedGuest.invitationId}`);

        if (updatedGuest.isInvitationCreated === true && updatedGuest.invitationId) {
            console.log('\n✨ VERIFICATION SUCCESSFUL ✨');
        } else {
            console.log('\n❌ VERIFICATION FAILED: Unexpected data state');
        }

    } catch (error) {
        console.error('✗ Verification failed:', error.response ? error.response.data : error.message);
    }
}

verify();
