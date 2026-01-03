const Transaction = require('../models/Transaction');
const Item = require('../models/Item');

exports.borrowItem = async (req, res) => {
    try {
        const { itemId, quantity, eventId, borrowerName } = req.body;
        
        const item = await Item.findByPk(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.availableStock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Create transaction
        const transaction = await Transaction.create({
            itemId,
            quantity,
            eventId,
            borrowerName,
            type: 'BORROW',
            status: 'APPROVED' // Auto-approve for now
        });

        // Update stock
        item.availableStock -= quantity;
        await item.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.returnItem = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const transaction = await Transaction.findByPk(transactionId);
        
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.type !== 'BORROW') return res.status(400).json({ message: 'Invalid transaction type' });
        if (transaction.status === 'COMPLETED') return res.status(400).json({ message: 'Item already returned' });

        // Update transaction
        transaction.status = 'COMPLETED';
        await transaction.save();

        // Restore stock
        const item = await Item.findByPk(transaction.itemId);
        if (item) {
            item.availableStock += transaction.quantity;
            await item.save();
        }

        // Record return transaction (optional, or just update the borrow status)
        // Here specific requirement might be to create a new "RETURN" transaction record too, but updating status is simpler for MVP.
        // Let's create a log for it if needed, but for now just updating status and stock is enough.
        
        res.json({ message: 'Item returned successfully', transaction });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({ include: Item });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
