grammar Sysy2022

//entry Model: 
//    ( compUnit+=CompUnit )*;

entry Model: 
    ( compUnit+=CompUnit | person+=Person | greetings+=Greeting )*;
//? ***************************************************/
Person:
    'person' name=Ident;
Greeting:
    'Hello' person=[Person:Ident];
//? ***************************************************/

CompUnit: 
    ( Temp /*(FuncDef | VarDecl)*/ /*| ConstDecl*/  /*Decl*/);

fragment Temp:
    btype='int' funcdef=FuncDef | btype='float' funcdef=FuncDef | btype='void' funcdef=FuncDef | betype='int' VarDecl | btype='float' VarDecl | ConstDecl;

//Decl: 
//    ConstDecl | VarDecl;

fragment ConstDecl:
    'const' /*btype=BType*/('int' | 'float') ConstDef (',' ConstDef)* ';';

fragment ConstDef:  
    constvarname=Ident ('[' ConstExp ']')* '=' ConstInitVal;

fragment ConstInitVal: 
    ConstExp | '{' ( ConstInitVal (',' ConstInitVal)* )? '}';

fragment VarDecl: 
    /*btype=BType*/ vardef=VarDef ( ',' vardef=VarDef )* ';';

/*fragment*/ VarDef: 
    varname=Ident ( '[' ConstExp ']' )* ('=' InitVal)? ; //| varname=Ident ( '[' ConstExp ']' )* '=' InitVal;

fragment InitVal: 
    Exp | '{' ( InitVal ( ',' InitVal )* )? '}';

FuncDef: 
    /*functype=FuncType*/ /*('int'|'void'|'float')*/ funcname=Ident '(' (FuncFParams)? ')' Block;

fragment FuncFParams: 
    FuncFParam ( ',' FuncFParam )*;

fragment FuncFParam: 
    /*btype=BType*/('int' | 'float') funcparamname=Ident ('[' ']' ( '[' Exp ']' )*)?;

fragment Block: 
    '{' ( blockItem+=BlockItem )* '}';

BlockItem: 
    ConstDecl | btype=('int'|'float') VarDecl /*Decl*/ | Stmt;

fragment Stmt: 
    LVal '=' Exp ';' 
    | (Exp)? ';' 
    | Block 
    | 'if' '(' Cond ')' Stmt ( 'else' Stmt )?
    | 'while' '(' Cond ')' Stmt
    | 'break' ';' 
    | 'continue' ';' 
    | char_return='return' (Exp)? ';' ;

fragment Exp: 
    AddExp;

fragment Cond: 
    LOrExp;

fragment LVal: 
    LVarname=Ident ('[' Exp ']')*;

fragment PrimaryExp: 
    '(' Exp ')' | LVal | Numbers;

fragment Numbers: 
    intnumber=IntConst | floatnumber=FloatConst;

fragment UnaryExp: 
    PrimaryExp | Funcname=Ident '(' (FuncRParams)? ')' | ('+'|'-'|'!') UnaryExp;

fragment FuncRParams: 
    Exp ( ',' Exp )*;

//MulExp:
//    UnaryExp | MulExp ('*' | '/' | '%') UnaryExp;

fragment MulExp:
    UnaryExp MulExp_temp;

fragment MulExp_temp:
    (mulop=('*' | '/' | '%') UnaryExp MulExp_temp)?;

//AddExp: 
//    MulExp | AddExp ('+' | '-') MulExp;

fragment AddExp:
    MulExp AddExp_temp;

fragment AddExp_temp:
    (('+' | '-') MulExp AddExp_temp)?;

//RelExp: 
//    AddExp | RelExp ('<' | '>' | '<=' | '>=') AddExp;

fragment RelExp:
    AddExp RelExp_temp;

fragment RelExp_temp:
    (('<' | '>' | '<=' | '>=') AddExp RelExp_temp)?;

//EqExp: 
//    RelExp | EqExp ('==' | '!=') RelExp;

fragment EqExp:
    RelExp EqExp_temp;

fragment EqExp_temp:
    (('==' | '!=') RelExp EqExp_temp)?;

//LAndExp: 
//    EqExp | LAndExp '&&' EqExp;

fragment LAndExp:
    EqExp LAndExp_temp;

fragment LAndExp_temp:
    ('&&' EqExp LAndExp_temp)?;


//LOrExp: 
//    LAndExp | LOrExp '||' LAndExp;

fragment LOrExp:
    LAndExp LOrExp_temp;

fragment LOrExp_temp:
    ('||' LAndExp LOrExp_temp)?;

fragment ConstExp: 
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