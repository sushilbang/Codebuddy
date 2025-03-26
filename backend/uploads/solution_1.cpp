#include<bits/stdc++.h>
using namespace std;
 
 
 
#define ll long long
 
 
 
 
int main(){
ios_base::sync_with_stdio(false);
cin.tie(NULL);
    ll n;
    cin>>n;
    while(n!=1){
        cout<<n<<" ";
        if(n%2){
            n*=3;
            n++;
        }
        else{
            n/=2;
        }
        
    }
    cout<<1<<endl;
return 0;
}
