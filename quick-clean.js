// Quick database cleanup - deletes all users
import fetch from 'node-fetch';

async function quickClean() {
    console.log('🧹 Quick Database Cleanup - Deleting All Users\n');

    try {
        // Get current user count
        const countResponse = await fetch('http://localhost:3001/api/anuschka-circle/users/count');
        const countResult = await countResponse.json();
        
        if (!countResult.success) {
            console.log('❌ Failed to get user count');
            return;
        }

        const totalUsers = countResult.count;
        console.log(`📊 Found ${totalUsers} users in database`);

        if (totalUsers === 0) {
            console.log('✅ Database is already clean!');
            return;
        }

        // Get all users
        const usersResponse = await fetch('http://localhost:3001/api/anuschka-circle/users');
        const usersResult = await usersResponse.json();
        
        if (!usersResult.success) {
            console.log('❌ Failed to get users list');
            return;
        }

        console.log('🔄 Deleting all users...');
        
        let deletedCount = 0;
        const users = usersResult.users;

        for (const user of users) {
            try {
                const deleteResponse = await fetch(`http://localhost:3001/api/anuschka-circle/users/${user.id}`, {
                    method: 'DELETE'
                });

                const deleteResult = await deleteResponse.json();
                
                if (deleteResult.success) {
                    console.log(`   ✅ Deleted: ${user.name} (${user.email})`);
                    deletedCount++;
                } else {
                    console.log(`   ❌ Failed to delete: ${user.name} - ${deleteResult.error}`);
                }

                // Small delay
                await new Promise(resolve => setTimeout(resolve, 50));

            } catch (error) {
                console.log(`   ❌ Error deleting ${user.name}: ${error.message}`);
            }
        }

        console.log(`\n🎉 Cleanup completed!`);
        console.log(`   Deleted: ${deletedCount}/${totalUsers} users`);

        // Final verification
        const finalCountResponse = await fetch('http://localhost:3001/api/anuschka-circle/users/count');
        const finalCountResult = await finalCountResponse.json();
        
        if (finalCountResult.success) {
            console.log(`   Remaining users: ${finalCountResult.count}`);
            if (finalCountResult.count === 0) {
                console.log('   ✅ Database is now completely clean!');
            }
        }

    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    }
}

// Run the cleanup
quickClean();
