# Copyright Brian Haney and Archie Chaudhury 2021

from dwave.system import DWaveSampler, EmbeddingComposite
import random

sampler = EmbeddingComposite(DWaveSampler())
Q = random.randint(0,1)
response = sampler.sample_qubo(Q, num_reads=5000, label='Quantum Reach')
print(response)

response2 = sampler.sample_qubo(Q, num_reads=1, label='Quantum Vote')
print(response2)
print(Q)

def vote():
    Voter0 = int(input("Vote"))
    Voter1 = int(input("Vote"))
    Voter2 = int(input("Vote"))
    votes = Voter0+Voter1+Voter2
    if votes is 3:
        print("move 5 Algo to Alice")
    if votes is 2:
        print("uncertain")
        #Quantum Reach
    else:
        print('Move 0.00 Algo to Alice')
    
vote()


def quantum_reach():
    if Q is 1:
        print('Move 5.00 Algo to Alice')
    else:
        print('Move 0.00 Algo to Alice')

#quantum_reach()
