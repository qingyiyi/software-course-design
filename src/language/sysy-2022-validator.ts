import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Sysy2022AstType, Model, Person, CompUnit, BlockItem} from './generated/ast.js';
import type { Sysy2022Services } from './sysy-2022-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: Sysy2022Services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.Sysy2022Validator;
    const checks: ValidationChecks<Sysy2022AstType> = {
        Model: validator.ModelTotoalValidator,
        CompUnit: validator.CompUnitTotoalValidator,
        BlockItem: validator.BlockItemTotoalValidator
    };
    registry.register(checks, validator);
}


let var_attribute_Map = new Map();

/**
 * Implementation of custom validations.
 */
export class Sysy2022Validator {

    ModelTotoalValidator(m:Model, accept: ValidationAcceptor): void{
        this.checkifunique(m, accept);
        //this.showvaribleinfo(m, accept);
        //this.gathervaribleinfo(m, accept);
    }

    CompUnitTotoalValidator(unit:CompUnit, accept: ValidationAcceptor): void{
        this.checkblockitemunique(unit, accept);
        this.gathervaribleinfo(unit, accept);
        this.showvaribleinfo(unit, accept);
    }

    BlockItemTotoalValidator(b:BlockItem, accept: ValidationAcceptor): void{
        this.gatherblockiteminfo(b, accept);
        
    }

    gathervaribleinfo(unit:CompUnit, accept: ValidationAcceptor): void{
        if(unit.vardef)
        {
            if(unit.vardef.varname)
            {
                let type = 'int';
                if(unit.btype) type = unit.btype;
                let name = unit.vardef.varname;
                let description = name + " is " + type + " variable ";
                var_attribute_Map.set(name, description);
                //accept('warning', `${description}`, {node: unit, property: 'vardef'});
            }
        }
        if(unit.funcdef)
        {
            if(unit.funcdef.funcname)
            {
                let type = unit.btype;
                let name = unit.funcdef.funcname;
                let description = name + " is " + type + " function ";
                var_attribute_Map.set(name, description);
                //accept('warning', `${description}`, {node: unit, property: 'vardef'});
            }
        }
    }

    gatherblockiteminfo(b:BlockItem, accept: ValidationAcceptor): void {
        if(b.vardef)
        {
            if(b.vardef.varname)
            {
                let type = 'int';
                if(b.btype) type = b.btype;
                let name = b.vardef.varname;
                let description = name + " is " + type + " variable ";
                var_attribute_Map.set(name, description);
                //accept('warning', `${description}`, {node: b, property: 'vardef'});
            }
        }
    }

    showvaribleinfo(unit:CompUnit/*b:BlockItem*/, accept: ValidationAcceptor): void{
        unit.funcdef?.blockItem.forEach(d=>
        {
            if(d.LVarname)
            {
                let description = var_attribute_Map.get(d.LVarname);
                accept('info', `${description}`, {node: d, property: 'LVarname'});
            }
        })
        unit.funcdef?.blockItem.forEach(d =>
        {
            if(d.funcname)
            {
                let description = var_attribute_Map.get(d.funcname);
                accept('info', `${description}`, {node: d, property: 'funcname'});
            }
        })
    }

    checkifunique(m:Model, accept: ValidationAcceptor): void {
        const reported = new Set();
        m.compUnit.forEach(d =>
        {
            if(d.vardef)
                if(d.vardef.varname){
                    if (reported.has(d.vardef.varname)) 
                    {
                        accept('error',  `Def has non-unique name '${d.vardef.varname}'.`,  {node: d, property: 'vardef'});
                    }
                    reported.add(d.vardef.varname);
                }
                if(d.constvarname)
                {
                    if (reported.has(d.constvarname)) 
                    {
                        accept('error',  `Def has non-unique name '${d.constvarname}'.`,  {node: d, property: 'constvarname'});
                    }
                    reported.add(d.constvarname);
                }
                if(d.funcdef){
                    if(d.funcdef.funcname){
                        if (reported.has(d.funcdef.funcname)) 
                        {
                            accept('error',  `Def has non-unique name '${d.funcdef.funcname}'.`,  {node: d, property: 'funcdef'});
                        }
                        reported.add(d.funcdef.funcname);
                    }
                }
        })
    }

    checkblockitemunique(m:CompUnit, accept: ValidationAcceptor): void {
        const reported = new Set();
        m.funcdef?.blockItem.forEach(d =>
        {
            if(d.vardef)
                if(d.vardef.varname){
                    if (reported.has(d.vardef.varname)) 
                    {
                        accept('error',  `Def has non-unique name '${d.vardef.varname}'.`,  {node: d, property: 'vardef'});
                    }
                    reported.add(d.vardef.varname);
                }
                if(d.constvarname)
                {
                    if (reported.has(d.constvarname)) 
                    {
                        accept('error',  `Def has non-unique name '${d.constvarname}'.`,  {node: d, property: 'constvarname'});
                    }
                    reported.add(d.constvarname);
                }
        })
    }


    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        // if (person.name) {
        //     const firstChar = person.name.substring(0, 1);
        //     if (firstChar.toUpperCase() !== firstChar) {
        //         accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
        //     }
        // }
    }
}
