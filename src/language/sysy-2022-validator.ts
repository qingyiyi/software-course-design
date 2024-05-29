import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Sysy2022AstType, Model/*CompUnit*/,CompUnit,  UnaryExp} from './generated/ast.js';
import type { Sysy2022Services } from './sysy-2022-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: Sysy2022Services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.Sysy2022Validator;
    const checks: ValidationChecks<Sysy2022AstType> = {
        //Model: validator.checkifunique,
        CompUnit: validator.setFuncNameAndParams,
        UnaryExp: validator.checkFuncNameAndParams
        //MulExp_temp: validator.checkifzeroasdividend
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
const canshuMap = new Map();

export class Sysy2022Validator {

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
    
    // 此函数用于检测函数并将<函数名，函数参数列表>加入到map中
    setFuncNameAndParams(unit:CompUnit, accept: ValidationAcceptor):void{
        let params:string[]=unit.paramtype;
        if(unit.funcname){
            let funcname:string=unit.funcname;
            // 函数名已经在函数列表中
            if(canshuMap.has(unit.funcname)){
                // 参数发生了编辑
                if(canshuMap.get(funcname)!==params){
                    canshuMap.delete(funcname);
                    canshuMap.set(funcname,params);
                }
                accept('info', `debuginfo name:'${unit.funcname}' params:'${params}'`, {node: unit, property: 'funcname'});
            }
            // 函数名不在参数列表中，将名和参数列表加入到map中
            else{
                canshuMap.set(funcname,params);
                accept('info', `debuginfo name:'${unit.funcname}' params:'${params}'`, {node: unit, property: 'funcname'});
            }
        }
    }

    // 此函数用于在调用函数时，检查函数是否已声明/参数列表是否正确
    checkFuncNameAndParams(unit:UnaryExp, accept: ValidationAcceptor):void{
        //let funcname = unit.unaryFuncname;
        //accept('error', `debug info: 调用的函数名为'${funcname}'`, {node: unit, property: 'unaryFuncname'});
        if(unit.unaryFuncname&&canshuMap.has(unit.unaryFuncname)){
            let funcname:string = unit.unaryFuncname;
            let params:string[]=canshuMap.get(funcname);
            // 调用时有参数
            if(unit.unaryFuncRParams){
                // 函数无参数
                if(params==undefined){
                    accept('error', `不匹配的参数数量!该函数无需传参`, {node: unit, property: 'unaryFuncRParams'});
                    return;
                }
                let diaoparamsNumber:number=unit.unaryFuncRParams.unaryFuncParamNums.length;
                // 参数数量不匹配
                if(diaoparamsNumber!==params.length){
                    accept('error', `不匹配的参数数量! 需要 ${params.length} 个参数 debuginfo:current params:'${diaoparamsNumber}'`, {node: unit, property: 'unaryFuncRParams'});
                }
                // 匹配参数类型
                // ******************** to do **********************
                else{
                    for (let i = 0; i < params.length; i++) {
                        if(params[i]=='int'){
                            if(unit.unaryFuncRParams.unaryFuncParamNums){
                                accept('error', `this is a debug info:'${unit.unaryFuncRParams.unaryFuncParamNums[i].toLocaleString}'`, {node: unit, property: 'unaryFuncRParams'});
                            }
                        }
                    }
                }
            }
            // 调用时无参数
            else{
                if(params!==undefined&&params.length!==0)
                    accept('error', `不匹配的参数数量! 需要 '${params.length}' 个参数 debuginfo:current params:0`, {node: unit, property: 'unaryFuncRParams'});
                }
            
            

        }     
    }
}
