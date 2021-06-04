'reach 0.1';

const [ isVote, NO, YES] = makeEnum(2);
 /* Declares the possible options for the vote and sets an array of length 2 for it. */
const [ finalResult, FAIL, DRAW, SUCCESS ] = makeEnum(3);
 /* Declares the possibilities for the final result and sets an array of length 3 */

const consensus = (voteA, voteB) =>
      voteA + voteB;
       /* Declares the formula for the consensus. Essentially states that if NO
       is 0 and YES is 1, then adding these values from the two different voters
       together will determine what
       the final result should be from the finalResult array  */

assert(consensus(NO, YES) ==  DRAW);
assert(consensus(YES, YES) == SUCCESS);
assert(consensus(NO, NO) == FAIL);
/* Declares Assertions for what the final value should be. It then checks these
values. */

const Voter =
      { ...hasRandom,
        getVote: Fun([], UInt),
        seeResult: Fun([UInt], Null),
        informTimeout: Fun([], Null) };
const Alice =
      { ...Voter,
        stake: UInt };
const Bob =
      { ...Voter,
        acceptStake: Fun([UInt], Null) };

        /*Declares the classes of Bob, Alice, and Voter.*/

const DEADLINE = 30;
export const main =
  Reach.App(
    {},
    [Participant('Alice', Alice), Participant('Bob', Bob)],
    (A, B) => {
      const informTimeout = () => {
        each([A, B], () => {
          interact.informTimeout(); }); };
           /* Defines what particpants can do in regards to timeouts */

      A.only(() => {
        const stake = declassify(interact.stake); });
      A.publish(stake)
        .pay(stake);
      commit();

      B.only(() => {
        interact.acceptStake(stake); });
      B.pay(stake)
        .timeout(DEADLINE, () => closeTo(A, informTimeout));

         /* Allows A(the validator) to publish the stake and ticket price, and then ensures that B accepts it. */

      var result = DRAW;
      invariant(balance() == 2 * stake);
      while ( result == DRAW ) {
        commit();

        A.only(() => {
          const _voteA = interact.getVote();
          const [_decisionA, _saltA] = makeCommitment(interact, _voteA);
          const decisionA = declassify(_decisionA); });
        A.publish(decisionA)
          .timeout(DEADLINE, () => closeTo(B, informTimeout));
        commit();

        unknowable(B, A(_voteA, _saltA));
        B.only(() => {
          const voteB = declassify(interact.getVote()); });
        B.publish(voteB)
          .timeout(DEADLINE, () => closeTo(A, informTimeout));
        commit();

        A.only(() => {
          const [saltA, voteA] = declassify([_saltA, _voteA]); });
        A.publish(saltA, voteA)
          .timeout(DEADLINE, () => closeTo(B, informTimeout));
        checkCommitment(decisionA, saltA, voteA);

        result = consensus(voteA, voteB);
        continue; }
         /* Sets a loop that ensures that the results are properly compiled, and allows the organization to have full consensus without relying on quantum voting if they want to */
      transfer(2 * stake).to(result == SUCCESS ? A : B);
      commit();

      each([A, B], () => {
        interact.seeResult(result); });
        /*Allows the voters to see the result*/
      exit(); });
