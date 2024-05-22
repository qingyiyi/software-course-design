grammar Sysy2022

//entry Model: 
//    ( compUnit+=CompUnit )*;

entry Model: 
    ( compUnit+=CompUnit |person+=Person|greetings+=Greeting)*;
//? ***************************************************/
Person:
    'person' name=Ident;
Greeting:
    'Hello' person=[Person:Ident];
//? ***************************************************/

CompUnit: 
    ( Temp /*(FuncDef | VarDecl)*/ /*| ConstDecl*/  /*Decl*/);

Temp:
    ('int'|'float') (FuncDef | VarDecl) | 'void' FuncDef | ConstDecl;



//Decl: 
//    ConstDecl | VarDecl;

ConstDecl:
    'const' /*btype=BType*/('int' | 'float') ConstDef (',' ConstDef)* ';';

ConstDef:  
    name=Ident ('[' ConstExp ']')* '=' ConstInitVal;

ConstInitVal: 
    ConstExp | '{' ( ConstInitVal (',' ConstInitVal)* )? '}';

VarDecl: 
    /*btype=BType*/ VarDef ( ',' VarDef )* ';';

VarDef: 
    /*name=Ident ( '[' ConstExp ']' )* |*/ name=Ident ( '[' ConstExp ']' )* ('=' InitVal)?;

InitVal: 
    Exp | '{' ( InitVal ( ',' InitVal )* )? '}';

FuncDef: 
    /*functype=FuncType*/ /*('int'|'void'|'float')*/ name=Ident '(' (FuncFParams)? ')' Block;

FuncFParams: 
    FuncFParam ( ',' FuncFParam )*;

FuncFParam: 
    /*btype=BType*/('int' | 'float') name=Ident ('[' ']' ( '[' Exp ']' )*)?;

fragment Block: 
    '{' ( BlockItem )* '}';

BlockItem: 
    ConstDecl | ('int'|'float') VarDecl /*Decl*/ | Stmt;

Stmt: 
    LVal '=' Exp ';' 
    | (Exp)? ';' 
    | Block 
    | 'if' '(' Cond ')' Stmt ( 'else' Stmt )?
    | 'while' '(' Cond ')' Stmt
    | 'break' ';' 
    | 'continue' ';' 
    | 'return' (Exp)? ';' ;

Exp: 
    AddExp;

Cond: 
    LOrExp;

LVal: 
    (LVarname=[VarDef:Ident] /*Ident*/) ('[' Exp ']')*;

PrimaryExp: 
    '(' Exp ')' | LVal | Numbers;

Numbers: 
    intnumber=IntConst | floatnumber=FloatConst;

UnaryExp: 
    PrimaryExp | Funcname=[FuncDef:Ident] '(' (FuncRParams)? ')' | ('+'|'-'|'!') UnaryExp;

FuncRParams: 
    Exp ( ',' Exp )*;

//MulExp:
//    UnaryExp | MulExp ('*' | '/' | '%') UnaryExp;

MulExp:
    UnaryExp MulExp_temp;

MulExp_temp:
    (('*' | '/' | '%') UnaryExp MulExp_temp)?;

//AddExp: 
//    MulExp | AddExp ('+' | '-') MulExp;

AddExp:
    MulExp AddExp_temp;

AddExp_temp:
    (('+' | '-') MulExp AddExp_temp)?;

//RelExp: 
//    AddExp | RelExp ('<' | '>' | '<=' | '>=') AddExp;

RelExp:
    AddExp RelExp_temp;

RelExp_temp:
    (('<' | '>' | '<=' | '>=') AddExp RelExp_temp)?;

//EqExp: 
//    RelExp | EqExp ('==' | '!=') RelExp;

EqExp:
    RelExp EqExp_temp;

EqExp_temp:
    (('==' | '!=') RelExp EqExp_temp)?;

//LAndExp: 
//    EqExp | LAndExp '&&' EqExp;

LAndExp:
    EqExp LAndExp_temp;

LAndExp_temp:
    ('&&' EqExp LAndExp_temp)?;


//LOrExp: 
//    LAndExp | LOrExp '||' LAndExp;

LOrExp:
    LAndExp LOrExp_temp;

LOrExp_temp:
    ('||' LAndExp LOrExp_temp)?;

ConstExp: 
    AddExp;



//terminal UnaryOp: /'+'|'-'|'!'/;
terminal IntConst returns number: /[0-9]+/;
terminal FloatConst returns number: /[0-9]+.[0-9]*/;

terminal BType:/int|float/;
terminal FuncType:/void|int|float/;
terminal Ident:/[a-zA-Z0-9]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;