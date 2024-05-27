import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Sysy2022AstType, Model/*CompUnit*/, Person, CompUnit } from './generated/ast.js';
import type { Sysy2022Services } from './sysy-2022-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: Sysy2022Services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.Sysy2022Validator;
    const checks: ValidationChecks<Sysy2022AstType> = {
        //Person: validator.checkPersonStartsWithCapital,
        Model: validator.checkifunique,
        CompUnit: validator.checkblockitemunique
        //MulExp_temp: validator.checkifzeroasdividend
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class Sysy2022Validator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

    checkifunique(m:Model, accept: ValidationAcceptor): void {
        const reported = new Set();
        m.compUnit.forEach(d =>
        {
            if(d.varname){
                if (reported.has(d.varname)) 
                {
                    accept('error',  `Def has non-unique name '${d.varname}'.`,  {node: d, property: 'varname'});
                }
                reported.add(d.varname);
            }
            if(d.constvarname)
            {
                if (reported.has(d.constvarname)) 
                {
                    accept('error',  `Def has non-unique name '${d.constvarname}'.`,  {node: d, property: 'constvarname'});
                }
                reported.add(d.constvarname);
            }
            if(d.funcname){
                if (reported.has(d.funcname)) 
                {
                    accept('error',  `Def has non-unique name '${d.funcname}'.`,  {node: d, property: 'funcname'});
                }
                reported.add(d.funcname);
            }
        })
    }

    checkblockitemunique(m:CompUnit, accept: ValidationAcceptor): void {
        const reported = new Set();
        m.blockItem.forEach(d =>
        {
            if(d.varname){
                if (reported.has(d.varname)) 
                {
                    accept('error',  `Def has non-unique name '${d.varname}'.`,  {node: d, property: 'varname'});
                }
                reported.add(d.varname);
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

    // checkifzeroasdividend(mulexp: MulExp_temp, accept: ValidationAcceptor): void {
    //     if(mulexp.mulop == '/')
    //     {
    //         if(!mulexp.numbers)
    //             accept('error', '0 cannot be dividend', {node: mulexp, property: 'numbers'});
    //     }
    // }

}
