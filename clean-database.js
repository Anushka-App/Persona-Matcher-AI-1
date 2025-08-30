// Database cleaning script for Anuschka Circle
import fetch from 'node-fetch';

async function cleanDatabase() {
    console.log('🧹 Database Cleaning Tool for Anuschka Circle\n');

    try {
        // First, get all users to show what we're working with
        console.log('📊 Current database status:');
        const countResponse = await fetch('http://localhost:3001/api/anuschka-circle/users/count');
        const countResult = await countResponse.json();
        
        if (countResult.success) {
            console.log(`   Total users: ${countResult.count}`);
        }

        const usersResponse = await fetch('http://localhost:3001/api/anuschka-circle/users');
        const usersResult = await usersResponse.json();
        
        if (usersResult.success && usersResult.users.length > 0) {
            console.log('\n📋 Current users:');
            usersResult.users.forEach((user, index) => {
                console.log(`   ${index + 1}. ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Membership: ${user.membership_number}`);
            });
        } else {
            console.log('   No users found in database.');
            return;
        }

        console.log('\n🧹 Cleaning Options:');
        console.log('1. Delete all users (complete cleanup)');
        console.log('2. Delete specific user by ID');
        console.log('3. Delete users by email pattern');
        console.log('4. Delete test users only');
        console.log('5. Exit without cleaning');

        // For this script, we'll do a complete cleanup
        console.log('\n🔄 Performing complete database cleanup...');
        
        let deletedCount = 0;
        const usersToDelete = usersResult.users;

        for (const user of usersToDelete) {
            try {
                console.log(`   Deleting user: ${user.name} (${user.email})...`);
                
                const deleteResponse = await fetch(`http://localhost:3001/api/anuschka-circle/users/${user.id}`, {
                    method: 'DELETE'
                });

                const deleteResult = await deleteResponse.json();
                
                if (deleteResult.success) {
                    console.log(`   ✅ Deleted user ID: ${user.id}`);
                    deletedCount++;
                } else {
                    console.log(`   ❌ Failed to delete user ID: ${user.id}: ${deleteResult.error}`);
                }

                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.log(`   ❌ Error deleting user ID: ${user.id}: ${error.message}`);
            }
        }

        console.log(`\n🎉 Database cleanup completed!`);
        console.log(`   Deleted ${deletedCount} users out of ${usersToDelete.length} total users`);

        // Verify cleanup
        console.log('\n🔍 Verifying cleanup...');
        const verifyResponse = await fetch('http://localhost:3001/api/anuschka-circle/users/count');
        const verifyResult = await verifyResponse.json();
        
        if (verifyResult.success) {
            console.log(`   Remaining users: ${verifyResult.count}`);
            if (verifyResult.count === 0) {
                console.log('   ✅ Database is now clean!');
            } else {
                console.log('   ⚠️ Some users may still remain in database');
            }
        }

    } catch (error) {
        console.error('❌ Database cleanup failed:', error.message);
    }
}

// Function to delete specific user by ID
async function deleteUserById(userId) {
    try {
        console.log(`🗑️ Deleting user ID: ${userId}...`);
        
        const response = await fetch(`http://localhost:3001/api/anuschka-circle/users/${userId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ User ID ${userId} deleted successfully`);
            return true;
        } else {
            console.log(`❌ Failed to delete user ID ${userId}: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error deleting user ID ${userId}:`, error.message);
        return false;
    }
}

// Function to delete users by email pattern
async function deleteUsersByEmailPattern(pattern) {
    try {
        console.log(`🗑️ Deleting users with email pattern: ${pattern}...`);
        
        const usersResponse = await fetch('http://localhost:3001/api/anuschka-circle/users');
        const usersResult = await usersResponse.json();
        
        if (!usersResult.success) {
            console.log('❌ Failed to get users list');
            return 0;
        }

        const matchingUsers = usersResult.users.filter(user => 
            user.email.toLowerCase().includes(pattern.toLowerCase())
        );

        console.log(`   Found ${matchingUsers.length} users matching pattern`);

        let deletedCount = 0;
        for (const user of matchingUsers) {
            const deleted = await deleteUserById(user.id);
            if (deleted) deletedCount++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`✅ Deleted ${deletedCount} users with email pattern: ${pattern}`);
        return deletedCount;
    } catch (error) {
        console.error('❌ Error deleting users by email pattern:', error.message);
        return 0;
    }
}

// Function to delete test users only
async function deleteTestUsers() {
    try {
        console.log('🗑️ Deleting test users only...');
        
        const testPatterns = ['test', 'example', 'demo', 'temp'];
        let totalDeleted = 0;

        for (const pattern of testPatterns) {
            const deleted = await deleteUsersByEmailPattern(pattern);
            totalDeleted += deleted;
        }

        console.log(`✅ Total test users deleted: ${totalDeleted}`);
        return totalDeleted;
    } catch (error) {
        console.error('❌ Error deleting test users:', error.message);
        return 0;
    }
}

// Export functions for manual use
export { cleanDatabase, deleteUserById, deleteUsersByEmailPattern, deleteTestUsers };

// Run the main cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    cleanDatabase();
}
