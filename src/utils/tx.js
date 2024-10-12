module.exports.extractExchanges = (tx, options={}) => {
    const lsfSell = 0x00020000 // See "lsfSell" flag in rippled source code
    let ledger = tx.inLedger;
    let ledger_index = tx.ledger_index;
	let hash = tx.hash || tx.transaction?.hash || tx.tx?.hash
	let taker = tx.Account || tx.transaction?.Account || tx.tx?.Account
    let date = tx.date || tx.transaction?.date || null
    let meta = tx.meta || tx.metaData
	let exchanges = []

    if (!meta || meta.TransactionResult !== 'tesSUCCESS')
		return [];

	for (let affected of meta.AffectedNodes) {
		let node = affected.ModifiedNode || affected.DeletedNode

		if(!node || node.LedgerEntryType !== 'Offer')
			continue

		if(!node.PreviousFields || !node.PreviousFields.TakerPays || !node.PreviousFields.TakerGets)
			continue

		let maker = node.FinalFields.Account
		let seq = node.FinalFields.Sequence
		let previousTakerPays = fromRippledAmount(node.PreviousFields.TakerPays)
		let previousTakerGets = fromRippledAmount(node.PreviousFields.TakerGets)
		let finalTakerPays = fromRippledAmount(node.FinalFields.TakerPays)
		let finalTakerGets = fromRippledAmount(node.FinalFields.TakerGets)
        let flags = node.FinalFields?.Flags || 0;
        let dir = (flags & lsfSell) !== 0?'sell':'buy'
        let data = {
            dir,
            flags,
            ledger,
            ledger_index,
			hash,
			maker,
			taker,
			seq,
            date,
			paid: {
				//currency: decodeCurrency(finalTakerPays.currency), 
                currency: finalTakerPays.currency, 
				issuer: finalTakerPays.issuer,
				value: Decimal.sub(previousTakerPays.value, finalTakerPays.value).toString()
			},
			got: {
				//currency: decodeCurrency(finalTakerGets.currency), 
                currency: finalTakerGets.currency, 
				issuer: finalTakerGets.issuer,
				value: Decimal.sub(previousTakerGets.value, finalTakerGets.value).toString()
			}
		}

		exchanges.push(data)
	}

	if(options.collapse){
		let collapsed = []

		for(let e of exchanges){
			let col = collapsed.find(c => 
				compareCurrency(c.paid, e.paid) 
				&& compareCurrency(c.got, e.got)
			)

			if(!col){
				collapsed.push({
					paid: e.paid,
					got: e.got
				})
			}else{
				col.paid.value = Decimal.sum(col.paid.value, e.paid.value)
					.toString()

				col.got.value = Decimal.sum(col.got.value, e.got.value)
					.toString()
			}
		}

		return collapsed
	}

	return exchanges
}