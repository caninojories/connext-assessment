import csv from 'csvtojson/v2'
import { writeFileSync } from 'fs'

const csvFilePaths = ['./files/csv/users1.csv', './files/csv/users2.csv']
const PREFIX_TO_REMOVE = 'ACN'

interface JsonItem {
	first_name: string
  last_name: string
  user: string
  email: string
  name: string
  phone: string
  cc: string
  amount: string
  date: string
}

interface IPerson {
  firstName: string
  lastName: string
}

export class User {
  public name: string
  public phone: number
  public person: IPerson
  public amount: number
  public date: string
  public costCenterNum: string

  public assimilate?(model: User) {
    for (const key in model) {
      this[key] = model[key]
    }

    return this
  }
}

const run = async () => {
	const results: User[][] =  await Promise.all(csvFilePaths.map(async (csvFilePath) => {
    return transformCsvToJson(csvFilePath)
  }))

  let users: User[] = results.reduce((acc, curVal) => {
    return acc.concat(curVal)
  }, [])

  writeFileSync('user.json', JSON.stringify(users, null, 2), 'utf8')
}

const transformCsvToJson = async (csvFilePath: string): Promise<User[]> => {
  const userData: User[] = []

  await csv({
		delimiter: '||'
	})
	.fromFile(csvFilePath)
	.subscribe((json: any) => {
		const item: JsonItem = json
		return new Promise((resolve) => {
			const user = new User()
      const phone = parseToInt(item.phone.replace(/[^\d+]+/g, ''))
      const dateSplit = item.date.split('/')
      const date = `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`
      const costCenterNum = item.cc.replace(PREFIX_TO_REMOVE, '')

			user.assimilate({
				name: `${item.first_name} ${item.last_name}`,
				phone,
				person: {
					firstName: item.first_name,
					lastName: item.last_name
				},
				amount: parseFloat(item.amount),
				date,
				costCenterNum,
			})

      userData.push(user)

			resolve()
		})
	})

  return userData
}

const parseToInt = (data: string) => {
  return parseInt(data)
}

run()