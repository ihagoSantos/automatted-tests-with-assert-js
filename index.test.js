import assert from 'assert'
import Product from './product.js'
import Service from './service.js'

const callTracker = new assert.CallTracker()

// quando o programa terminar, valida todas as chamadas
process.on('exit', () => callTracker.verify())

// should throw an error when description is less than 5 characters long
{
    const params = { 
        description: "my p", 
        id: 1, 
        price: 1000 
    }
    
    const product = new Product({
        onCreate: () => {},
        service: new Service()
    })
    
    assert.rejects(
        () => product.create(params),
        { message: 'description must be higher than 5' },
        'it should throw an error with wrong description'
    )
    
}

// should save product successfully
{
    // MOCK => o que precisamos para o teste funcionar
    const params = { 
        description: "my product", 
        id: 1, 
        price: 1000 
    }

    // serviceStub = impedir que seja ONLINE (externo)
    const spySave = callTracker.calls(1)
    const serviceStub = {
        async save(params) {
            // SPY: espiona a função
            spySave(params)
            return `${params.id} saved with success!`
        }
    }

    const fn = (msg) => {
        assert.deepStrictEqual(msg.id, params.id, 'id shuld be the same')
        assert.deepStrictEqual(msg.price, params.price, 'price shuld be the same')
        assert.deepStrictEqual(msg.description, params.description.toUpperCase(), 'description shuld be the same')
    }
    const spyOnCreate = callTracker.calls(fn, 1)

    const product = new Product({
        onCreate: spyOnCreate,
        service: serviceStub // aqui fizemos o STUB
    })
    
    const result = await product.create(params)
    assert.deepStrictEqual(result, `${params.id} SAVED WITH SUCCESS!`)
    
}