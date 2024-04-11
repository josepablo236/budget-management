export class Budget{
    idBudget : string = '';
    name : string = '';
    initialValue : number = 0;
    date: string = '';
    incomes : number = 0;
    expenses : number = 0;
    savings ?: number;
    savingPercent ?: number;
    total : number = 0;
    categories: Category[] = [];
}

export class Movement{
    idMovement : string = '';
    amount: number = 0;
    type: string = '';
    description: string = '';
    category: string = '';
}

export class Category{
    idCategory: string = '';
    name: string = '';
    movements: Movement[] = [];
    amount: number = 0;
    type: string = '';
}

export class ItemCategory{
    value: string = '';
    text: string = '';
}