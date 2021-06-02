'reach 0.1';
'use strict';
 
export const main =
    Reach.App(
    {},
Participant('Alice', { request: UInt, info: Bytes(128) }),
Participant('Bob', { want: Fun([UInt], Null), got: Fun([Bytes(128)], Null) })],
(A, B) => {

    // ...body...
    
} );

