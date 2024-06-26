import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { Sysy2022AstType, Model, Person, CompUnit, BlockItem, FuncDef, UnaryExp } from './generated/ast.js';
import type { Sysy2022Services } from './sysy-2022-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: Sysy2022Services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.Sysy2022Validator;
    const checks: ValidationChecks<Sysy2022AstType> = {
        Model: validator.ModelTotoalValidator,
        FuncDef: validator.FuncDefTotoalValidator,
        CompUnit: validator.CompUnitTotoalValidator,
        UnaryExp: validator.UnaryExpTotalValidator,
        BlockItem: validator.BlockItemTotoalValidator
    };
    registry.register(checks, validator);
}


let var_attribute_Map = new Map();


/**
 * Implementation of custom validations.
 */

/***************************************全局变量区******************************************/
const canshuMap = new Map();
/***************************************全局变量区结束***************************************/
export class Sysy2022Validator {
    ModelTotoalValidator(m:Model, accept: ValidationAcceptor): void{
        this.checkifunique(m, accept);
        this.checkiffuncused(m, accept);
        //this.gathervaribleinfo(m, accept);
    }
    FuncDefTotoalValidator(funcdef:FuncDef, accept: ValidationAcceptor): void{
        this.setFuncNameAndParams(funcdef,accept);
    }
    CompUnitTotoalValidator(unit:CompUnit, accept: ValidationAcceptor): void{
        this.checkblockitemunique(unit, accept);
        this.gathervaribleinfo(unit, accept);
        this.showvaribleinfo(unit, accept);
        this.chekcvaribletype(unit, accept);
    }
    UnaryExpTotalValidator(unaryExp:UnaryExp,accept: ValidationAcceptor):void{
        this.checkFuncNameAndParams(unaryExp,accept);
    }
    BlockItemTotoalValidator(b:BlockItem, accept: ValidationAcceptor): void{
        this.gatherblockiteminfo(b, accept);
    }

    checkiffuncused(m:Model, accept: ValidationAcceptor):void{

        let func_isused_Map = new Map();

        //搜集所有函数名
        m.compUnit.forEach(d=>{
            if(d.funcdef)
            {
                let name = d.funcdef.funcname;
                func_isused_Map.set(name, 1);
            }
        })

        //查看是否使用过
        m.compUnit.forEach(d=>{
            d.funcdef?.blockItem.forEach(item=>{
                if(item.unaryExp?.unaryFuncname)
                {
                    let name = item.unaryExp.unaryFuncname;
                    if(name != 'main')
                    {
                        if(func_isused_Map.get(name))
                        {
                            func_isused_Map.delete(name);
                            func_isused_Map.set(name,2);
                        }
                    }
                }
            })
        })

        //对于没有使用的报错
        m.compUnit.forEach(d=>{
            if(d.funcdef)
            {
                let name = d.funcdef.funcname;
                if(func_isused_Map.get(name) == 1 && name != 'main')
                {
                    accept('warning', `function ${name} never used`, {node: d.funcdef, property:'funcname'});
                }
            }
        })

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

        if(unit.funcdef)
        {
            let var_isused_Map = new Map();

            //遍历3次，分别是收集变量，搜索是否使用，显示信息
            unit.funcdef.blockItem.forEach(d =>{
                if(d.vardef?.varname)
                {
                    let name = d.vardef?.varname;
                    var_isused_Map.set(name, 1);
                }
            })

            unit.funcdef.blockItem.forEach(d =>{
                if(d.LVarname)
                {
                    let name = d.LVarname;
                    if(var_isused_Map.get(name))
                    {
                        var_isused_Map.delete(name);
                        var_isused_Map.set(name,2);
                    }
                    else
                    {
                        accept("error", `variable '${name}' is not declared in this scope`,
                         {
                            node: d, 
                            property:'LVarname',
                            code:'VarNotDeclared'
                        });
                    }
                }
                if(d.exp?.unaryExp.LVarname)
                {
                    let name = d.exp.unaryExp.LVarname;
                    if(var_isused_Map.get(name))
                    {
                        var_isused_Map.delete(name);
                        var_isused_Map.set(name,2);
                    }
                    else
                    {
                        accept("error", `variable '${name}' is not declared in this scope`, {node: d.exp.unaryExp, property:'LVarname'});
                    }
                }
            })

            unit.funcdef.blockItem.forEach(d =>{
                if(d.vardef?.varname)
                {
                    let name = d.vardef?.varname;
                    if(var_isused_Map.get(name) == 1)
                    {
                        accept("warning", "this varible is never used", 
                        {
                            node: d.vardef, 
                            property: 'varname',
                            code:'NeverUsed'
                        }
                        )
                    }
                }
            })
        }

    }

    chekcvaribletype(unit:CompUnit, accept: ValidationAcceptor): void{
        if(unit.funcdef)
        {
            let var_type_Map = new Map();
            //搜集类型信息
            unit.funcdef.blockItem.forEach(d =>{
                if(d.vardef?.varname)
                {
                    let name = d.vardef?.varname;
                    var_type_Map.set(name, d.btype);
                }
            })

            //寻找type是否一致
            let type = 'int';
            unit.funcdef.blockItem.forEach(d =>{
                if(d.LVarname)
                {
                    let name = d.LVarname;
                    if(var_type_Map.has(name))
                    {
                        //accept('error', `variable ${name} ${var_type_Map.get(name)}`, {node:d, property:'blockItem'});
                        if(var_type_Map.get(name) != type)
                        {
                            accept('error', `variable ${name}'s type is not suitable.`, 
                            {
                                node:d, 
                                property:'LVarname',
                                code:'NotSuitableType'
                        });
                        }
                    }
                }
                if(d.exp?.unaryExp.LVarname)
                {
                    let name = d.exp.unaryExp.LVarname;
                    if(var_type_Map.has(name))
                    {
                        //accept('error', `variable ${name} ${var_type_Map.get(name)}`, {node:d, property:'blockItem'});
                        if(var_type_Map.get(name) != type)
                        {
                            accept('error', `variable ${name}'s type is not suitable.`, {node:d.exp.unaryExp, property:'LVarname'});
                        }
                    }
                }
            })

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
                if(var_attribute_Map.get(name))
                {
                    var_attribute_Map.delete(name);
                }
                var_attribute_Map.set(name, description);
                //accept('warning', `${description}`, {node: b, property: 'vardef'});
            }

        }
    }

    showvaribleinfo(unit:CompUnit, accept: ValidationAcceptor): void{
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
            if(d.unaryExp?.unaryFuncname)
            {
                let description = var_attribute_Map.get(d.unaryExp.unaryFuncname);
                accept('info', `${description}`, {node: d.unaryExp, property: 'unaryFuncname'});
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
                        accept('error',  `Def has non-unique name '${d.vardef.varname}'.`,  {node: d.vardef, property: 'varname'});
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
                            accept('error',  `Def has non-unique name '${d.funcdef.funcname}'.`,  {node: d.funcdef, property: 'funcname'});
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

    // 此函数用于检测函数并将<函数名，函数参数列表>加入到map中
    setFuncNameAndParams(unit:FuncDef, accept: ValidationAcceptor):void{
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
                //accept('info', `debuginfo name:'${unit.funcname}' params:'${params}'`, {node: unit, property: 'funcname'});
            }
            // 函数名不在参数列表中，将名和参数列表加入到map中
            else{
                canshuMap.set(funcname,params);
                //accept('info', `debuginfo name:'${unit.funcname}' params:'${params}'`, {node: unit, property: 'funcname'});
            }
        }
    }

    // 此函数用于在调用函数时，检查函数是否已声明/参数列表是否正确
    checkFuncNameAndParams(unit:UnaryExp, accept: ValidationAcceptor):void{
        // if(unit.unaryFuncname){
        //     let funcname = unit.unaryFuncname;
        //     accept('error', `debug info: 调用的函数名为'${funcname}'`, {node: unit, property: 'unaryFuncname'});
        // }
        // else if(unit.unaryFuncRParams){
        //     let funcParams = unit.unaryFuncRParams;
        //     accept('error', `debug info: 调用的函数参数为'${funcParams}'`, {node: unit, property: 'unaryFuncRParams'});
        // }
        if(unit.unaryFuncname&&canshuMap.has(unit.unaryFuncname)){
            let funcname:string = unit.unaryFuncname;
            let params:string[]=canshuMap.get(funcname);
            // 调用时有参数
            if(unit.unaryFuncRParams){
                // 函数无参数
                if(params==undefined){
                    accept('error', `不匹配的参数数量! 该函数无需传参`, {node: unit, property: 'unaryFuncRParams'});
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
                            if(unit.unaryFuncRParams.unaryFuncParamNums[i]&&(unit.unaryFuncRParams.unaryFuncParamNums[i].toString()).indexOf('.')!==-1){
                                accept('error', `不匹配的参数类型! 需要传入int类型的参数 debuginfo:current params:'${unit.unaryFuncRParams.unaryFuncParamNums[i].toString()}'`, {node: unit, property: 'unaryFuncRParams'});
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