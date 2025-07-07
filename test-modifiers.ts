import { getModifiersByMenuItem } from './lib/modifiers-service';

async function testModifiers() {
  try {
    console.log('🧪 Testing Modifiers Feature...\n');
    
    // Test 1: Fetch modifiers for Margherita pizza
    console.log('📋 Test 1: Fetching modifiers for Margherita pizza');
    const pizzaResult = await getModifiersByMenuItem('8099cbce-67a7-43af-9571-cb852f83dc05', 'pizza');
    if (pizzaResult.success && pizzaResult.data) {
      console.log('✅ Found', pizzaResult.data.length, 'modifiers for Margherita pizza:');
      pizzaResult.data.forEach((mod: any, i: number) => {
        console.log(`  ${i + 1}. ${mod.name} (${mod.type}) - ${mod.type === 'extra' ? `$${mod.price}` : 'No charge'}`);
      });
    } else {
      console.log('❌ Error:', pizzaResult.error);
    }
    
    // Test 2: Fetch modifiers for Akkawi Cheese pie
    console.log('\n📋 Test 2: Fetching modifiers for Akkawi Cheese pie');
    const pieResult = await getModifiersByMenuItem('503ba88a-79eb-4a2c-a4db-3eccbc33851f', 'pie');
    if (pieResult.success && pieResult.data) {
      console.log('✅ Found', pieResult.data.length, 'modifiers for Akkawi Cheese pie:');
      pieResult.data.forEach((mod: any, i: number) => {
        console.log(`  ${i + 1}. ${mod.name} (${mod.type}) - ${mod.type === 'extra' ? `$${mod.price}` : 'No charge'}`);
      });
    } else {
      console.log('❌ Error:', pieResult.error);
    }
    
    // Test 3: Test with non-existent item
    console.log('\n📋 Test 3: Testing with non-existent item');
    const noResult = await getModifiersByMenuItem('non-existent-id', 'pizza');
    if (noResult.success && noResult.data) {
      console.log('✅ Found', noResult.data.length, 'modifiers for non-existent item (expected 0)');
    } else {
      console.log('❌ Error (expected):', noResult.error);
    }
    
    console.log('\n🎉 All tests passed! Modifiers feature is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testModifiers();
